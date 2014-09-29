function Product(form, options) {
    this.form = $(form);
    this.button = this.form.find("#button-cart");
    for (var k in options) {
        this[k] = options[k];
    }
    var self = this;
    // add to cart block: services
    this.form.find(".services input[type=checkbox]").click(function() {
        var obj = $('select[name="service_variant[' + $(this).val() + ']"]');
        if (obj.length) {
            if ($(this).is(':checked')) {
                obj.removeAttr('disabled');
            } else {
                obj.attr('disabled', 'disabled');
            }
        }
        self.updatePrice();
    });

    this.form.find(".services .service-variants").on('change', function() {
        self.updatePrice();
    });

    this.form.find(".skus input[type=radio]").click(function() {
        if ($(this).data('image-id')) {
            $("#product-image-" + $(this).data('image-id')).click();
        }
        if ($(this).data('disabled')) {
            self.button.addClass('disabled');
        } else {
            self.button.removeClass('disabled');
        }
        var sku_id = $(this).val();
        self.updateSkuServices(sku_id);
        self.updatePrice();
    });
    this.form.find(".skus input[type=radio]:checked").click();

    this.form.find("select.sku-feature").change(function() {
        var key = "";
        self.form.find("select.sku-feature").each(function() {
            key += $(this).data('feature-id') + ':' + $(this).val() + ';';
        });
        var sku = self.features[key];
        if (sku) {
            if (sku.image_id) {
                $("#product-image-" + sku.image_id).click();
            }
            self.updateSkuServices(sku.id);
            if (sku.available) {
                self.button.removeClass('disabled');
            } else {
                self.form.find("div.stocks div").hide();
                self.form.find(".sku-no-stock").show();
                self.button.addClass('disabled');
            }
            self.form.find("#prices .price-new").data('price', sku.price);
            self.updatePrice(sku.price, sku.compare_price);
        } else {
            self.form.find("div.stocks div").hide();
            self.form.find(".sku-no-stock").show();
            self.button.addClass('disabled');
            self.form.find("#prices .price-old").hide();
        }
    });
    this.form.find("select.sku-feature:first").change();

    if (!this.form.find(".skus input:radio:checked").length) {
        this.form.find(".skus input:radio:enabled:first").attr('checked', 'checked');
    }

    this.form.submit(function() {
        var f = $(this);
        $.post(f.attr('action') + '?html=1', f.serialize(), function(response) {
            if (response.status == 'ok') {
                var cart = $('#cart');
                var cart_div = f;

                var clone = $('<div class="cart"></div>').append(f.clone());
                if (cart_div.closest('.dialog').length) {
                    clone.insertAfter(cart_div.closest('.dialog'));
                } else {
                    clone.insertAfter(cart_div);
                }
                clone.css({
                    top: cart_div.offset().top,
                    left: cart_div.offset().left,
                    width: cart_div.width() + 'px',
                    height: cart_div.height() + 'px',
                    position: 'absolute',
                    overflow: 'hidden'
                }).animate({
                    top: cart.offset().top,
                    left: cart.offset().left,
                    width: 0,
                    height: 0,
                    opacity: 0.5
                }, 500, function() {
                    $(this).remove();
                    var q = parseInt(f.find('.q-mini').val());
                    if (cart.find('tr[data-id=' + response.data.item_id + ']').length) {
                        var item = cart.find('tr[data-id=' + response.data.item_id + ']');
                        var quantity = parseInt(item.find('.quantity span').text());
                        item.find('.quantity span').text(quantity + q);
                        cart.find('.shopping_cart_total').html(response.data.total);
                        cart.find('#cart-total2').html(response.data.count);
                        cart.find('.shopping_cart_discount').html(response.data.discount);
                    } else {
                        var info = cart_div.find('.ajax_product_info');
                        var tpl_data = {
                            url: info.data('url'),
                            name: info.data('name'),
                            img: info.data('img'),
                            price: info.data('price'),
                            quantity: q,
                            id: response.data.item_id
                        };
                        $('#cart_block_list_item_tmpl').tmpl(tpl_data).appendTo('.mini-cart-info table tbody');
                        cart.find('.shopping_cart_total').html(response.data.total);
                        cart.find('#cart-total2').html(response.data.count);
                        cart.find('.shopping_cart_discount').html(response.data.discount);
                    }
                    $('#notification').html('<div class="success" style="display: none;"><i class="fa fa-thumbs-up"></i>Товар успешно добавлен в корзину!<span class="close"><i class="fa fa-times-circle"></i></span></div>');
                    $('.success').fadeIn('slow');
                    setTimeout(function() {
                        $('.success').fadeOut(1000)
                    }, 3000);

                });
                if (cart_div.closest('.dialog').length) {
                    cart_div.closest('.dialog').hide().find('.cart').empty();
                }
                if (response.data.error) {
                    alert(response.data.error);
                }
            } else if (response.status == 'fail') {
                alert(response.errors);
            }
        }, "json");
        return false;
    });
}

Product.prototype.currencyFormat = function(number, no_html) {
    // Format a number with grouped thousands
    //
    // +   original by: Jonas Raoni Soares Silva (http://www.jsfromhell.com)
    // +   improved by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
    // +	 bugfix by: Michael White (http://crestidg.com)

    var i, j, kw, kd, km;
    var decimals = this.currency.frac_digits;
    var dec_point = this.currency.decimal_point;
    var thousands_sep = this.currency.thousands_sep;

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
    var s = no_html ? this.currency.sign : this.currency.sign_html;
    if (!this.currency.sign_position) {
        return s + this.currency.sign_delim + number;
    } else {
        return number + this.currency.sign_delim + s;
    }
};


Product.prototype.serviceVariantHtml = function(id, name, price) {
    return $('<option data-price="' + price + '" value="' + id + '"></option>').text(name + ' (+' + this.currencyFormat(price, 1) + ')');
};

Product.prototype.updateSkuServices = function(sku_id) {
    this.form.find("div.stocks div").hide();
    this.form.find(".sku-" + sku_id + "-stock").show();
    for (var service_id in this.services[sku_id]) {
        var v = this.services[sku_id][service_id];
        if (v === false) {
            this.form.find(".service-" + service_id).hide().find('input,select').attr('disabled', 'disabled').removeAttr('checked');
        } else {
            this.form.find(".service-" + service_id).show().find('input').removeAttr('disabled');
            if (typeof (v) == 'string') {
                this.form.find(".service-" + service_id + ' .service-price').html(this.currencyFormat(v));
                this.form.find(".service-" + service_id + ' input').data('price', v);
            } else {
                var select = this.form.find(".service-" + service_id + ' .service-variants');
                var selected_variant_id = select.val();
                for (var variant_id in v) {
                    var obj = select.find('option[value=' + variant_id + ']');
                    if (v[variant_id] === false) {
                        obj.hide();
                        if (obj.attr('value') == selected_variant_id) {
                            selected_variant_id = false;
                        }
                    } else {
                        if (!selected_variant_id) {
                            selected_variant_id = variant_id;
                        }
                        obj.replaceWith(this.serviceVariantHtml(variant_id, v[variant_id][0], v[variant_id][1]));
                    }
                }
                this.form.find(".service-" + service_id + ' .service-variants').val(selected_variant_id);
            }
        }
    }
};
Product.prototype.updatePrice = function(price, compare_price) {

    if (price === undefined) {
        var input_checked = this.form.find(".skus input:radio:checked");
        if (input_checked.length) {
            var price = parseFloat(input_checked.data('price'));
            var compare_price = parseFloat(input_checked.data('compare-price'));
        } else {
            var price = parseFloat(this.form.find(".price .price-new").data('price'));
        }
    }
    if (compare_price) {
        if (!this.form.find("#prices .price-old").length) {
            this.form.find('#prices').append('<span class="price-old"></span>');
        }
        this.form.find("#prices .price-old").html(this.currencyFormat(compare_price)).show();
    } else {
        this.form.find("#prices .price-old").hide();
    }
    var self = this;
    this.form.find(".services input:checked").each(function() {
        var s = $(this).val();
        if (self.form.find('.service-' + s + '  .service-variants').length) {
            price += parseFloat(self.form.find('.service-' + s + '  .service-variants :selected').data('price'));
        } else {
            price += parseFloat($(this).data('price'));
        }
    });
    this.form.find("#prices .price-new").html(this.currencyFormat(price));
}

$(function() {

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
});