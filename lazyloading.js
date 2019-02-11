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
console.log(222);
$(function () {

    var paging = $('.lazyloading-paging');
    if (!paging.length) {
        return;
    }
    // check need to initialize lazy-loading
    var current = paging.find('li.selected');
    if (current.children('a').text() != '1') {
        return;
    }
    paging.hide();
    var win = $(window);

    // prevent previous launched lazy-loading
    win.lazyLoad('stop');

    // check need to initialize lazy-loading
    var next = current.next();
    if (next.length) {
        win.lazyLoad({
            container: '#container #content',
            load: function () {
                win.lazyLoad('sleep');

                var paging = $('.lazyloading-paging').hide();

                // determine actual current and next item for getting actual url
                var current = paging.find('li.selected');
                var next = current.next();
                var url = next.find('a').attr('href');
                if (!url) {
                    win.lazyLoad('stop');
                    return;
                }

                var product_list = $('#product-list .productlistio ul');
                var loading = paging.parent().find('.loading').parent();
                if (!loading.length) {
                    loading = $('<div><i class="icon16 loading"></i>Loading...</div>').insertBefore(paging);
                }

                loading.show();
                $.get(url, function (html) {
                    var tmp = $('<div></div>').html(html);
                    product_list.append(tmp.find('#product-list .productlistio ul').children());
                    var tmp_paging = tmp.find('.lazyloading-paging').hide();
                    paging.replaceWith(tmp_paging);
                    paging = tmp_paging;

                    // check need to stop lazy-loading
                    var current = paging.find('li.selected');
                    var next = current.next();
                    if (next.length) {
                        win.lazyLoad('wake');
                    } else {
                        win.lazyLoad('stop');
                    }
                    if ($('.productlistio').hasClass('product-list')) {
                        display_view('list');
                    }
                    loading.hide();
                    tmp.remove();
                });
            }
        });
    }
});