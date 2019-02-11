function initClearViewed() {
    $(document).on('click', '.bt_clean_list', function () {
        var list = $(this).data('list');
        $.cookie(list, null, {expires: 30, path: '/'});
        if (list != 'shop_compare') {
            location.reload();
            return false;
        } else {
            location = location.href.replace(/compare\/.*$/, 'compare/');
            return false;
        }
    });
}

function initQuantity(e) {
    if (!e) {
        e = $('body');
    }
    e.find('input.q-mini').change(function () {
        var count = $(this).val();
        if (isNaN(count) || count < 1) {
            $(this).val(1).change();
        }
    });
    e.find('a.cart-minus').click(function () {
        var qty = $(this).siblings('input.q-mini');
        var count = parseInt(qty.val());
        if (count != 1 && count) {
            qty.val(count - 1).change();
        } else {
            qty.val(1).change();
        }
        return false;
    });
    e.find('a.cart-plus').click(function () {
        var qty = $(this).siblings('input.q-mini');
        var count = parseInt(qty.val());
        if (count) {
            qty.val(count + 1).change();
        } else {
            qty.val(1).change();
        }
        return false;
    });
}

$(document).ready(function () {
    initQuantity();
    initCompare();
    initWishlist();
    initClearViewed();
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
    $('#selectProductSort').change(function () {
        location.assign($(this).val());
    });

    $('#nb_item').change(function () {
        if ($(this).val()) {
            $.cookie('products_per_page', $(this).val(), {expires: 30, path: '/'});
        } else {
            $.cookie('products_per_page', '', {expires: 0, path: '/'});
        }
        location.reload();
    });

    $('.dialog').on('click', 'a.dialog-close', function () {
        $(this).closest('.dialog').hide().find('.cart').empty();
        return false;
    });

    $(document).keyup(function (e) {
        if (e.keyCode == 27) {
            $(".dialog:visible").hide().find('.cart').empty();
        }
    });

    $("#content").on('click', '#product-list form.addtocart .button:not(.disabled),.related-slider form.addtocart .button:not(.disabled)', function () {
        $(this).closest('form').submit();
        return false;

    });

    $("#content").on('submit', '#product-list form.addtocart,.related-slider form.addtocart', function () {
        var f = $(this);
        if (f.data('url')) {
            var d = $('#dialog');
            var c = d.find('.cart');
            c.load(f.data('url'), function () {
                c.prepend('<a href="#" class="dialog-close">&times;</a>');
                d.show();
                if ((c.height() > c.find('form').height())) {
                    c.css('bottom', 'auto');
                } else {
                    c.css('bottom', '15%');
                }
                initQuantity(d);
            });
            return false;
        }
        var html = '';
        if (ruble_symbol !== undefined && ruble_symbol == 1) {
            html = '?html=1';
        }
        $.post(f.attr('action') + html, f.serialize(), function (response) {
            if (response.status == 'ok') {
                /* подсветка и счетчик panel*/
                var now_int = $("#panel .cart .count").text();
                $('#panel .cart .count').html(response.data.count);
                var new_int = $("#panel .cart .count").text();
                punsh_utdate(now_int, new_int, 'cart');
                if (response.data.count > 0) {
                    $('#panel .cart').removeAttr('disabled');
                }


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
                    background: '#fff',
                    overflow: 'hidden'
                }).insertAfter(origin).animate({
                    top: cart.offset().top,
                    left: cart.offset().left,
                    width: 0,
                    height: 0,
                    opacity: 0.5
                }, 500, function () {
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
                        cart.find('.shopping_cart_discount').html(response.data.discount);
                    }
                    $('#notification').html('<div class="success" style="display: none;"><i class="fa fa-thumbs-up"></i>Товар успешно добавлен в корзину!<span class="close"><i class="fa fa-times-circle"></i></span></div>');
                    $('.success').fadeIn('slow');
                    setTimeout(function () {
                        $('.success').fadeOut(1000)
                    }, 3000);
                    if ($('.Bettertogether').length) {
                        location.reload();
                    }

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

    $('.filters.ajax form input').change(function () {
        var f = $(this).closest('form');
        var url = '?' + f.serialize();
        $(window).lazyLoad && $(window).lazyLoad('sleep');
        $.get(url, function (html) {
            var tmp = $('<div></div>').html(html);
            $('#product-list').html(tmp.find('#product-list').html());
            if (!!(history.pushState && history.state !== undefined)) {
                window.history.pushState({}, '', url);
            }
            $(window).lazyLoad && $(window).lazyLoad('reload');
            view = $.totalStorage('display');
            if (view) {
                display_view(view);
            } else {
                display_view('grid');
            }
        });
    });


    $(".button-search").click(function () {
        $(this).closest('form').submit();
    });


    $('.success span, .warning span, .attention span, .information span').live('click', function () {
        $(this).parent().fadeOut('slow', function () {
            $(this).remove();
        });
    });

    /************bx-slider***************/
    $('.related-slider').bxSlider({
        pager: false,
        controls: true,
        slideMargin: 20,
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





function display_view(view) {
    if (view == 'list') {
        $('.product-grid ').addClass('product-list').removeClass('product-grid');
        $('.product-list ul').removeClass('row');
        $('.product-list ul li').removeClass('col-sm-4');
        $('.product-list ul li').find('.image').addClass('col-sm-3');
        $('.product-list ul li').find('.left').addClass('col-sm-9');
        $('.product-list ul li').find('>div').attr('class', 'row');
        $('#list_a').attr('id', 'list_b');
        $('#grid_b').attr('id', 'grid_a');
        $.totalStorage('display', 'list');

    } else {
        $('.product-list').addClass('product-grid').removeClass('product-list');
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

$(document).ready(function () {
    $('.display .display_view').click(function () {
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
    $('.price_slider').each(function () {
        if (!$(this).find('.slider-range').length) {
            var self = $(this);
            var slider_range = $('<div class="slider-range"></div>').appendTo(self);
            var min_input = $('input[name="' + $(this).data('name-min') + '"]');
            var max_input = $('input[name="' + $(this).data('name-max') + '"]');
            slider_range.slider({
                range: true,
                min: self.data('min'),
                max: self.data('max'),
                values: [min_input.val() ? min_input.val() : self.data('min'), max_input.val() ? max_input.val() : self.data('max')],
                slide: function (event, ui) {
                    var v = ui.values[0] == $(this).slider('option', 'min') ? '' : ui.values[0];
                    min_input.val(v);
                    v = ui.values[1] == $(this).slider('option', 'max') ? '' : ui.values[1];
                    max_input.val(v);
                },
                stop: function (event, ui) {
                    min_input.change();
                }
            });
            min_input.add(max_input).change(function () {
                var min_val = min_input.val() === '' ? slider_range.slider('option', 'min') : parseFloat(min_input.val());
                var max_val = max_input.val() === '' ? slider_range.slider('option', 'max') : parseFloat(max_input.val());
                if (max_val >= min_val) {
                    slider_range.slider('option', 'values', [min_val, max_val]);
                }
            });
        }
    });
}

function initWishlist() {
    $('#product-list').on('click', '.add_to_wishlist', function () {
        var wishlist = $.cookie('shop_wishlist');
        var now_int = $("#panel .wishlist .count").text();
        if (!$(this).hasClass('checked')) {
            if (wishlist) {
                wishlist += ',' + $(this).data('id');
            } else {
                wishlist = '' + $(this).data('id');
            }
            $("#panel .wishlist .count").text(wishlist.split(',').length);
            if (wishlist.split(',').length > 0) {
                $("#panel .wishlist").removeAttr('disabled');
            }
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

            if (wishlist.length != 0) {
                $.cookie('shop_wishlist', wishlist.join(','), {expires: 30, path: '/'});
            } else {
                $.cookie('shop_wishlist', null, {expires: 30, path: '/'});
                $("#panel .wishlist").attr('disabled', 'disabled');
            }
            $(this).removeClass('checked');
        }
        var new_int = $("#panel .wishlist .count").text();
        punsh_utdate(now_int, new_int, 'wishlist');
        return false;
    });
}

function initCompare() {
    $('#product-list').on('click', '.add_to_compare', function () {
        var compare = $.cookie('shop_compare');
        var now_int = $("#panel .compare .count").text();
        if (!$(this).hasClass('checked')) {
            if (compare) {
                compare += ',' + $(this).data('id');
            } else {
                compare = '' + $(this).data('id');
            }
            $('.total-compare-val').text(compare.split(',').length);
            if (compare.split(',').length > 1) {
                $("#panel .compare").removeAttr('disabled');
            }
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
                $("#panel .compare").attr('disabled', 'disabled');
                $(".bt_compare_bottom").attr('disabled', 'disabled');
            }
            if (compare.length != 0) {
                $.cookie('shop_compare', compare.join(','), {expires: 30, path: '/'});
            } else {
                $.cookie('shop_compare', null, {expires: 30, path: '/'});
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
        var new_int = $("#panel .compare .count").text();
        punsh_utdate(now_int, new_int, 'compare');
        return false;
    });
}

$(document).ready(function () {
    $('.box.man[data-count] .box-content').append('<a class="show_all">Показать все</a>');
    $('.show_all').click(function () {
        var text = $(this).text();
        if (text == 'Показать все') {
            $(this).text('Скрыть');
            $(this).closest('.box').find('li').show(300);
        } else {
            $(this).text('Показать все');
            var count = $(this).closest('.box').data('count') + 1;
            $(this).closest('.box').find('li:nth-child(n+' + count + ')').hide(300);
        }
    });


});
