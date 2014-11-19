$(document).ready(function() {
    initCompare();
    initWishlist();
    if (tagcanvas) {
        initTagcanvas();
    }
    if (filter_slider) {
        initFilterSlider();
    }

    if ($('#is_product_page').length) {
        var $this = $('#is_product_page');
        var products = $.cookie('viewed_products');
        if (products) {
            products = products.split(',');
        } else {
            products = [];
        }

        var i = $.inArray($this.val(), products);
        if (i != -1) {
            products.splice(i, 1);
        }
        products.unshift($this.val());
        if (products) {
            $.cookie('viewed_products', products.join(','), {expires: 30, path: '/'});
        }

    }
    $('#selectProductSort option').click(function() {
        location.assign($(this).val());
    });

    $('#nb_item').change(function() {
        if ($(this).val()) {
            $.cookie('products_per_page', $(this).val(), {expires: 30, path: '/'});
        } else {
            $.cookie('products_per_page', '', {expires: 0, path: '/'});
        }
        location.reload();
    });

    $('.dialog').on('click', 'a.dialog-close', function() {
        $(this).closest('.dialog').hide().find('.cart').empty();
        return false;
    });

    $(document).keyup(function(e) {
        if (e.keyCode == 27) {
            $(".dialog:visible").hide().find('.cart').empty();
        }
    });

    $("#content").on('click', '#product-list form.addtocart .button,.related-slider form.addtocart .button', function() {
        $(this).closest('form').submit();
        return false;

    });

    $("#content").on('submit', '#product-list form.addtocart,.related-slider form.addtocart', function() {
        var f = $(this);
        if (f.data('url')) {
            var d = $('#dialog');
            var c = d.find('.cart');
            c.load(f.data('url'), function() {
                c.prepend('<a href="#" class="dialog-close">&times;</a>');
                d.show();
                if ((c.height() > c.find('form').height())) {
                    c.css('bottom', 'auto');
                } else {
                    c.css('bottom', '15%');
                }
            });
            return false;
        }
        $.post(f.attr('action') + '?html=1', f.serialize(), function(response) {
            if (response.status == 'ok') {
                var cart = $('#cart');
                var origin = f.closest('li');
                var block = $('<div></div>').append(origin.html());

                block.css({
                    'z-index': 10,
                    top: origin.offset().top,
                    left: origin.offset().left,
                    width: origin.width() + 'px',
                    height: origin.height() + 'px',
                    position: 'absolute',
                    overflow: 'hidden'
                }).insertAfter(origin).animate({
                    top: cart.offset().top,
                    left: cart.offset().left,
                    width: 0,
                    height: 0,
                    opacity: 0.5
                }, 500, function() {
                    $(this).remove();
                    if (cart.find('tr[data-id=' + response.data.item_id + ']').length) {
                        var item = cart.find('tr[data-id=' + response.data.item_id + ']');
                        var quantity = parseInt(item.find('.quantity span').text());
                        item.find('.quantity span').text(quantity + 1);
                        cart.find('.shopping_cart_total').html(response.data.total);
                        cart.find('#cart-total2').html(response.data.count);
                        cart.find('.shopping_cart_discount').html(response.data.discount);
                    } else {
                        var info = origin.find('.ajax_product_info');
                        var tpl_data = {
                            url: info.data('url'),
                            name: info.data('name'),
                            img: info.data('img'),
                            price: info.data('price'),
                            quantity: 1,
                            id: response.data.item_id
                        };
                        $('#cart_block_list_item_tmpl').tmpl(tpl_data).appendTo('.mini-cart-info table tbody');
                        cart.find('.shopping_cart_total').html(response.data.total);
                        cart.find('#cart-total2').html(response.data.count);
                        $('#panel .cart .count').html(response.data.count);
                        cart.find('.shopping_cart_discount').html(response.data.discount);
                    }
                    $('#notification').html('<div class="success" style="display: none;"><i class="fa fa-thumbs-up"></i>Товар успешно добавлен в корзину!<span class="close"><i class="fa fa-times-circle"></i></span></div>');
                    $('.success').fadeIn('slow');
                    setTimeout(function() {
                        $('.success').fadeOut(1000)
                    }, 3000);

                });

                if (response.data.error) {
                    alert(response.data.error);
                }
            } else if (response.status == 'fail') {
                alert(response.errors);
            }
        }, "json");
        return false;
    });
    $('.filters.ajax form input').change(function() {
        var f = $(this).closest('form');
        var url = '?' + f.serialize();
        $(window).lazyLoad && $(window).lazyLoad('sleep');
        $.get(url, function(html) {
            var tmp = $('<div></div>').html(html);
            $('#product-list').html(tmp.find('#product-list').html());
            if (!!(history.pushState && history.state !== undefined)) {
                window.history.pushState({}, '', url);
            }
            $(window).lazyLoad && $(window).lazyLoad('reload');
        });
    });
});

jQuery(document).ready(function() {
    $(".button-search").click(function() {
        $(this).closest('form').submit();
    });



    $('.success span, .warning span, .attention span, .information span').live('click', function() {
        $(this).parent().fadeOut('slow', function() {
            $(this).remove();
        });
    });

    /************bx-slider***************/
    $('.related-slider').bxSlider({
        pager: false,
        controls: true,
        slideMargin: 30,
        minSlides: 1,
        maxSlides: 4,
        slideWidth: 170,
        infiniteLoop: false,
        moveSlides: 1,
        nextText: '<i class="fa fa-chevron-right"></i>',
        prevText: '<i class="fa fa-chevron-left"></i>'
    });

    $('#image-additional').bxSlider({
        pager: false,
        controls: true,
        slideMargin: 10,
        minSlides: 3,
        maxSlides: 3,
        slideWidth: 70,
        infiniteLoop: false,
        moveSlides: 1,
        nextText: '<i class="fa fa-chevron-right"></i>',
        prevText: '<i class="fa fa-chevron-left"></i>'
    });
});
/*************************************************************************************************************related coroucel*****************************************************************************/
/*************************************************************************************************************related coroucel*****************************************************************************/
$(document).ready(function() {
    $('.related-carousel .box-product ul').jcarousel({
        vertical: false,
        visible: 4,
        scroll: 1
    });

    $('div.image-caroucel').jcarousel({
        vertical: false,
        visible: 3,
        scroll: 1
    });
});

$(document).ready(function() {
    function display_view() {
        if (view == 'list') {
            $('.product-grid ').attr('class', 'product-list');
            $('.product-list ul').removeClass('row');
            $('.product-list ul li').removeClass('col-sm-4');
            $('.product-list ul li').find('.image').addClass('col-sm-3');
            $('.product-list ul li').find('.left').addClass('col-sm-9');
            $('.product-list ul li').find('>div').attr('class', 'row');
            $('#list_a').attr('id', 'list_b');
            $('#grid_b').attr('id', 'grid_a');
            $.totalStorage('display', 'list');

        } else {
            $('.product-list').attr('class', 'product-grid');
            $('.product-grid ul').addClass('row');
            $('.product-grid ul li').addClass('col-sm-4');
            $('.product-grid ul li').find('.image').removeClass('col-sm-3');
            $('.product-grid ul li').find('.left').removeClass('col-sm-9');
            $('.product-grid ul li').find('>div').attr('class', 'padding');
            $('#list_b').attr('id', 'list_a');
            $('#grid_a').attr('id', 'grid_b');
            $.totalStorage('display', 'grid');
        }
    }

    $('.display .display_view').click(function() {
        view = $(this).data('view');
        display_view(view);
    });
    view = $.totalStorage('display');

    if (view) {
        display_view(view);
    } else {
        display_view('grid');
    }
});

function initTagcanvas() {
    var canvas = $('#tag-cloud-canvas #canvas');
    var width = canvas.closest('.box').width() - 20;
    if (width < 140) {
        width = 140;
    }
    if (width > 300) {
        width = 300;
    }
    $('#tag-cloud-canvas #canvas').width(width);
    $('#tag-cloud-canvas #canvas').height(width);
    if ($('#tag-cloud-canvas #canvas').tagcanvas({
        textColour: $('#tag-cloud a').css('color'),
        outlineColour: '#000',
        outlineMethod: "colour",
        outlineThickness: 1,
        reverse: true,
        hideTags: true,
        depth: 0.8,
        maxSpeed: 0.05
    }, 'tag-cloud')) {
        $('#tag-cloud-canvas').show();
        $('#tag-cloud').hide();
    }
}
function initFilterSlider() {
    $('#filter-slider').slider({
        range: true,
        min: filter_slider_min_value,
        max: filter_slider_max_value,
        values: [filter_slider_min_price, filter_slider_max_price],
        slide: function(event, ui) {
            var v = ui.values[0];
            if (v == $(this).slider('option', 'min')) {
                v = '';
            }
            $('.filters input[name="price_min"]').val(v);
            v = ui.values[1];
            if (v == $(this).slider('option', 'max')) {
                v = '';
            }
            $('.filters input[name="price_max"]').val(v);
        },
        stop: function(event, ui) {
            $('input[name="price_min"]').change();
        }
    });
    $(".filters input[name=price_min], .filters input[name=price_max]").change(function() {
        var min = parseFloat($(".filters input[name=price_min]").val());
        if (!min) {
            min = $("#filter-slider").slider('option', 'min');
        }
        var max = parseFloat($(".filters input[name=price_max]").val());
        if (!max) {
            max = $("#filter-slider").slider('option', 'max');
        }
        if (max >= min) {
            $("#filter-slider").slider('option', 'values', [min, max]);
        }
    });
}

function initWishlist() {
    $('#product-list').on('click', '.add_to_wishlist', function() {
        var wishlist = $.cookie('shop_wishlist');
        if (!$(this).hasClass('checked')) {
            if (wishlist) {
                wishlist += ',' + $(this).data('id');
            } else {
                wishlist = '' + $(this).data('id');
            }
            $("#panel .wishlist .count").text(wishlist.split(',').length);
            $.cookie('shop_wishlist', wishlist, {expires: 30, path: '/'});
            $(this).addClass('checked');
        } else {
            if (wishlist) {
                wishlist = wishlist.split(',');
            } else {
                wishlist = [];
            }
            var i = $.inArray($(this).data('id') + '', wishlist);
            if (i != -1) {
                wishlist.splice(i, 1);
            }
            $("#panel .wishlist .count").text(wishlist.length);
            if (wishlist) {
                $.cookie('shop_wishlist', wishlist.join(','), {expires: 30, path: '/'});
            } else {
                $.cookie('shop_wishlist', null);
            }
            $(this).removeClass('checked');
        }
        return false;
    });
}

function initCompare() {
    $('#product-list').on('click', '.add_to_compare', function() {
        var compare = $.cookie('shop_compare');
        if (!$(this).hasClass('checked')) {
            if (compare) {
                compare += ',' + $(this).data('id');
            } else {
                compare = '' + $(this).data('id');
            }
            $('.total-compare-val').text(compare.split(',').length);
            $("#panel .compare .count").text(compare.split(',').length);
            if (compare.split(',').length > 1) {
                compare_url = compare_url.replace(/compare\/.*$/, 'compare/' + compare + '/');
                $(".bt_compare_bottom").removeAttr('disabled');
            }
            $.cookie('shop_compare', compare, {expires: 30, path: '/'});
            $(this).addClass('checked');
        } else {
            if (compare) {
                compare = compare.split(',');
            } else {
                compare = [];
            }
            var i = $.inArray($(this).data('id') + '', compare);
            if (i != -1) {
                compare.splice(i, 1);
            }
            $('.total-compare-val').text(compare.length);
            $("#panel .compare .count").text(compare.length);

            if (compare.length < 2) {
                $(".bt_compare_bottom").attr('disabled', 'disabled');
            }
            if (compare) {
                $.cookie('shop_compare', compare.join(','), {expires: 30, path: '/'});
            } else {
                $.cookie('shop_compare', null);
            }
            $(this).removeClass('checked');
        }

        if ($(".bt_compare_bottom").attr('href')) {
            var url = $(".bt_compare_bottom").attr('href').replace(/compare\/.*$/, 'compare/' + compare + '/');
            $(".bt_compare_bottom").attr('href', url);
        }
        if ($("#panel .compare").attr('href')) {
            var url = $("#panel .compare").attr('href').replace(/compare\/.*$/, 'compare/' + compare + '/');
            $("#panel .compare").attr('href', url);
        }
        return false;
    });
}