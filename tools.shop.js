$(document).ready(function() {

    $('.dialog').on('click', 'a.dialog-close', function() {
        $(this).closest('.dialog').hide().find('.cart').empty();
        return false;
    });

    $(document).keyup(function(e) {
        if (e.keyCode == 27) {
            $(".dialog:visible").hide().find('.cart').empty();
        }
    });

    $(".content").on('submit', '.product-list form.addtocart', function() {
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
                var cart_total = $(".cart-total");
                if ($(window).scrollTop() >= 35) {
                    cart_total.closest('#cart').addClass("fixed");
                }
                cart_total.closest('#cart').removeClass('empty');
                if ($("table.cart").length) {
                    $(".content").parent().load(location.href, function() {
                        cart_total.html(response.data.total);

                    });
                } else {
                    if (f.closest(".product-list").get(0).tagName.toLowerCase() == 'table') {
                        var origin = f.closest('tr');
                        var block = $('<div></div>').append($('<table></table>').append(origin.clone()));
                    } else {
                        var origin = f.closest('li');
                        var block = $('<div></div>').append(origin.html());
                    }
                    block.css({
                        'z-index': 10,
                        top: origin.offset().top,
                        left: origin.offset().left,
                        width: origin.width() + 'px',
                        height: origin.height() + 'px',
                        position: 'absolute',
                        overflow: 'hidden'
                    }).insertAfter(origin).animate({
                        top: cart_total.offset().top,
                        left: cart_total.offset().left,
                        width: 0,
                        height: 0,
                        opacity: 0.5
                    }, 500, function() {
                        $(this).remove();
                        cart_total.html(response.data.total);
                    });
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
/********************************** swipe ********************************************/
jQuery(document).ready(function() {
    jQuery('body .swipe-left').swiperight(function() {
        jQuery('body').addClass('ind');
    })
    jQuery('body').swipeleft(function() {
        jQuery('body').removeClass('ind');
    })
    jQuery('#page').click(function() {
        if (jQuery(this).parents('body').hasClass('ind')) {
            jQuery(this).parents('body').removeClass('ind');
            return false
        }
    })
    jQuery('.swipe-control').click(function() {
        if (jQuery(this).parents('body').hasClass('ind')) {
            jQuery(this).parents('body').removeClass('ind');
            return false
        }
        else {
            jQuery(this).parents('body').addClass('ind');
            return false
        }
    })

    $("#zoom_01").elevateZoom({gallery: 'image-additional', cursor: 'pointer', galleryActiveClass: 'active', imageCrossfade: true});
//pass the images to Fancybox
    $("#zoom_01").bind("click", function(e) {
        var ez = $('#zoom_01').data('elevateZoom');
        $.fancybox(ez.getGalleryList());
        return false;
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
    
    
    $(".addtocart").submit(function() {
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