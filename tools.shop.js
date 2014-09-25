$(document).ready(function() {
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
    $("#button-cart").click(function() {
        $(this).closest('form').submit();
    });
});

jQuery(document).ready(function() {
    $(".cart .button").click(function() {
        $(this).closest('form').submit();
    });
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