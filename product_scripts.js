
$(function() {
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

    $("#zoom_01").elevateZoom({
        preloading: 0,
        zoomType: "window",
        gallery: 'image-additional',
        cursor: "crosshair",
        galleryActiveClass: 'active',
        constrainType: 'width'
    });

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