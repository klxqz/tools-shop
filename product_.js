function currency_format(number, no_html) {
    // Format a number with grouped thousands
    //
    // +   original by: Jonas Raoni Soares Silva (http://www.jsfromhell.com)
    // +   improved by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
    // +	 bugfix by: Michael White (http://crestidg.com)

    var i, j, kw, kd, km;
    var decimals = currency.frac_digits;
    var dec_point = currency.decimal_point;
    var thousands_sep = currency.thousands_sep;

    // input sanitation & defaults
    if (isNaN(decimals = Math.abs(decimals))) {
        decimals = 2;
    }
    if (dec_point == undefined) {
        dec_point = ",";
    }
    if (thousands_sep == undefined) {
        thousands_sep = ".";
    }

    i = parseInt(number = (+number || 0).toFixed(decimals)) + "";

    if ((j = i.length) > 3) {
        j = j % 3;
    } else {
        j = 0;
    }

    km = (j ? i.substr(0, j) + thousands_sep : "");
    kw = i.substr(j).replace(/(\d{3})(?=\d)/g, "$1" + thousands_sep);
    //kd = (decimals ? dec_point + Math.abs(number - i).toFixed(decimals).slice(2) : "");
    kd = (decimals && (number - i) ? dec_point + Math.abs(number - i).toFixed(decimals).replace(/-/, 0).slice(2) : "");


    var number = km + kw + kd;
    var s = no_html ? currency.sign : currency.sign_html;
    if (!currency.sign_position) {
        return s + currency.sign_delim + number;
    } else {
        return number + currency.sign_delim + s;
    }
}

$(function() {

    var service_variant_html = function(id, name, price) {
        return '<option data-price="' + price + '" id="service-variant-' + id + '" value="' + id + '">' + name + ' (+' + currency_format(price, 1) + ')</option>';
    }

    var update_sku_services = function(sku_id) {
        $("div.stocks div").hide();
        $("#sku-" + sku_id + "-stock").show();
        for (var service_id in sku_services[sku_id]) {
            var v = sku_services[sku_id][service_id];
            if (v === false) {
                $("#service-" + service_id).hide().find('input,select').attr('disabled', 'disabled').removeAttr('checked');
            } else {
                $("#service-" + service_id).show().find('input').removeAttr('disabled');
                if (typeof (v) == 'string') {
                    $("#service-" + service_id + ' .service-price').html(currency_format(v));
                    $("#service-" + service_id + ' input').data('price', v);
                } else {
                    var selected_variant_id = $("#service-" + service_id + ' .service-variants').data('variant-id');
                    for (var variant_id in v) {
                        var obj = $("#service-variant-" + variant_id);
                        if (v[variant_id] === false) {
                            obj.hide();
                        } else {
                            if (!selected_variant_id) {
                                selected_variant_id = variant_id;
                            }
                            obj.replaceWith(service_variant_html(variant_id, v[variant_id][0], v[variant_id][1]));
                        }
                    }
                    $("#service-" + service_id + ' .service-variants').val(selected_variant_id);
                }
            }
        }
    }

    var g_slider = $('#gallery').bxSlider({
        pager: false,
        controls: true,
        minSlides: 1,
        maxSlides: 1,
        infiniteLoop: false,
        moveSlides: 1,
        nextText: '<i class="fa fa-chevron-right"></i>',
        prevText: '<i class="fa fa-chevron-left"></i>'
    });

    $("#product-skus input[type=radio]").click(function() {
        if ($(this).data('image-id')) {
            $("#product-image-" + $(this).data('image-id')).click();
            var slide = $("#g-product-image-" + $(this).data('image-id')).data('slide');
            g_slider.goToSlide(slide);
        }
        if ($(this).data('disabled')) {
            $(".add2cart #button-cart").hide();
        } else {
            $(".add2cart #button-cart").show();
        }
        var sku_id = $(this).val();
        update_sku_services(sku_id);
        update_price();
    });
    $("#product-skus input[type=radio]:checked").click();


    $("select.sku-feature").change(function() {
        var key = "";
        $("select.sku-feature").each(function() {
            key += $(this).data('feature-id') + ':' + $(this).val() + ';';
        });
        var sku = sku_features[key];
        if (sku) {
            if (sku.image_id) {
                $("#product-image-" + sku.image_id).click();
                var slide = $("#g-product-image-" + $(this).data('image-id')).data('slide');
                g_slider.goToSlide(slide);
            }
            update_sku_services(sku.id);
            if (sku.available) {
                $(".add2cart #button-cart").show();
            } else {
                $(".add2cart #button-cart").hide();
            }
            $(".add2cart .price").data('price', sku.price);
            update_price(sku.price, sku.compare_price);
        } else {
            $("div.stocks div").hide();
            $("#sku-no-stock").show();
            $(".add2cart input[type=submit]").attr('disabled', 'disabled');
            $(".add2cart .compare-at-price").hide();
            $(".add2cart .price").empty();
        }
    });
    $("select.sku-feature:first").change();

    function update_price(price, compare_price)
    {
        if (price === undefined) {
            if ($("#product-skus input:radio:checked").length) {
                var price = parseFloat($("#product-skus input:radio:checked").data('price'));
                var compare_price = parseFloat($("#product-skus input:radio:checked").data('compare-price'));
            } else {
                var price = parseFloat($(".add2cart .price").data('price'));
            }
        }
        if (compare_price) {
            if (!$(".add2cart .compare-at-price").length) {
                $(".add2cart").prepend('<span class="compare-at-price nowrap"></span>');
            }
            $(".add2cart .compare-at-price").html(currency_format(compare_price)).show();
        } else {
            $(".add2cart .compare-at-price").hide();
        }

        $("#cart-form .services input:checked").each(function() {
            var s = $(this).val();
            if ($('#service-' + s + '  .service-variants').length) {
                price += parseFloat($('#service-' + s + '  .service-variants :selected').data('price'));
            } else {
                price += parseFloat($(this).data('price'));
            }
        });
        $(".add2cart .price").html(currency_format(price));
    }

    if (!$("#product-skus input:radio:checked").length) {
        $("#product-skus input:radio:enabled:first").attr('checked', 'checked');
    }

    // add to cart block: services
    $(".cart .services input[type=checkbox]").click(function() {
        var obj = $('select[name="service_variant[' + $(this).val() + ']"]');
        if (obj.length) {
            if ($(this).is(':checked')) {
                obj.removeAttr('disabled');
            } else {
                obj.attr('disabled', 'disabled');
            }
        }
        update_price();
    });

    $(".cart .services .service-variants").on('change', function() {
        update_price();
    });

    // compare block
    $("a.compare-add").click(function() {
        var compare = $.cookie('shop_compare');
        if (compare) {
            compare += ',' + $(this).data('product');
        } else {
            compare = '' + $(this).data('product');
        }
        if (compare.split(',').length > 1) {
            var url = $("#compare-link").attr('href').replace(/compare\/.*$/, 'compare/' + compare + '/');
            $("#compare-link").attr('href', url).show().find('span.count').html(compare.split(',').length);
        }
        $.cookie('shop_compare', compare, {expires: 30, path: '/'});
        $(this).hide();
        $("a.compare-remove").show();
        return false;
    });
    $("a.compare-remove").click(function() {
        var compare = $.cookie('shop_compare');
        if (compare) {
            compare = compare.split(',');
        } else {
            compare = [];
        }
        var i = $.inArray($(this).data('product') + '', compare);
        if (i != -1) {
            compare.splice(i, 1)
        }
        $("#compare-link").hide();
        if (compare) {
            $.cookie('shop_compare', compare.join(','), {expires: 30, path: '/'});
        } else {
            $.cookie('shop_compare', null);
        }
        $(this).hide();
        $("a.compare-add").show();
        return false;
    });

    $("#cart-form").submit(function() {
        var f = $(this);
        $.post(f.attr('action') + '?html=1', f.serialize(), function(response) {
            if (response.status == 'ok') {
                var cart_total = $("#cart-total2");
                console.log(response.data);
                cart_total.html(response.data.count);
                $('#notification').html('<div class="success" style="display: none;"><i class="fa fa-thumbs-up"></i>Товар успешно добавлен в корзину!<span class="close"><i class="fa fa-times-circle"></i></span></div>');
                $('#cart-total-price').html(response.data.total);
                $('.success').fadeIn('slow');
                setTimeout(function() {
                    $('.success').fadeOut(1000)
                }, 3000);

            } else if (response.status == 'fail') {
                alert(response.errors);
            }
        }, "json");
        return false;
    });

    $("#zoom_01").elevateZoom({
        preloading: 0,
        zoomType: "window",
        gallery: 'image-additional',
        cursor: "crosshair",
        galleryActiveClass: 'active',
        constrainType: 'width'
    });

//pass the images to Fancybox
    $("#zoom_01").bind("click", function(e) {
        var ez = $('#zoom_01').data('elevateZoom');
        $.fancybox(ez.getGalleryList(), {
            prevEffect: 'none',
            nextEffect: 'none',
            loop: false,
            helpers: {
                title: {
                    type: 'outside'
                },
                buttons: {
                    position: 'bottom'
                }
            }
        });
        return false;
    });
});