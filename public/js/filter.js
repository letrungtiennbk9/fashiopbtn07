(function(global){
  let dc = {};
  let nItems = 5;
  let nLoaded = 0;
  let nTurn = 0;
  let sortType = "normal";

  let productsDbUrl = "https://still-plateau-02404.herokuapp.com/products/";
  let queryStr = "";
  let categorySingleProductHtmlUrl = '/snippets/category-single-product.hbs';
  let snippet;
  let data = [];

  getSnippet = async () => {
    await $.get(categorySingleProductHtmlUrl, (data, status) => {
      snippet = data;
    });
  }

  getSnippet();

  dc.getData = async () => {
    let realProductsDbUrl = productsDbUrl + nTurn + "/" + sortType + queryStr;
    realProductsDbUrl = encodeURI(realProductsDbUrl);
    let delta;
    await $.get(realProductsDbUrl, (res, status) => {
      data=res;
      delta = res.length;
      nTurn++;
    });
    buildView();
    nLoaded = data.length;
  }

  buildView = () => {
    let finalHtml = "";
    for(let i=0; i<data.length; i++){
      let tmp = insertProperty(snippet, "title", data[i].title);
      tmp = insertProperty(tmp, "price", data[i].price);
      tmp = insertProperty(tmp, "imagePath", data[i].imagePath);
      tmp = insertProperty(tmp, "_id", data[i]._id);
      finalHtml += tmp;
    }
    $("#category-single-product-section").empty();
    $("#category-single-product-section").append(finalHtml);
  }


  activePageNum = (pageNum) => {
    $('#page-pagination .page-item').each(function() {
      if($(this).hasClass("active")){
        $(this).removeClass("active");
      }
  
      if(parseInt($(this)[0].innerText) == pageNum){
        $(this).addClass("active");
      }
    });
  }


  dc.loadMoreNew = (nPage) => {
    activePageNum(nPage);
    
    (async () => {
      if(nPage*nItems > nLoaded){
        await dc.getData();
      }
  
      $('.f_p_item').each(function(i){
        if($(this)[0].style.display == 'block'){
          $(this)[0].style.display = 'none';
        }
      });
  
      $('.f_p_item').each(function(i){
        if(i>=nItems*(nPage-1) && (i<nItems*nPage)){
          if($(this)[0].style.display == 'none'){
            $(this)[0].style.display = 'block';
          }
        }
      });
    })();
  }


  dc.filter = () => {
    let tmpQueryStr = "?type=";
    $(".type-filter input").each(function() {
      if($(this)[0].checked){
        tmpQueryStr += $(this)[0].value + ",";
      }
    });
    tmpQueryStr = tmpQueryStr.substring(0, tmpQueryStr.length - 1);

    tmpQueryStr += "&brand=";
    $(".brand-filter input").each(function() {
      if($(this)[0].checked){
        tmpQueryStr += $(this)[0].value + ",";
      }
    });
    tmpQueryStr = tmpQueryStr.substring(0, tmpQueryStr.length - 1);

    tmpQueryStr += "&color=";
    $(".color-filter input").each(function() {
      if($(this)[0].checked){
        tmpQueryStr += $(this)[0].value + ",";
      }
    });
    tmpQueryStr = tmpQueryStr.substring(0, tmpQueryStr.length - 1);
    queryStr = tmpQueryStr;

    nTurn = 0;
    nLoaded = 0;

    dc.loadMoreNew(1);
  }

  dc.sort = (type) => {
    sortType = type;
    nTurn = 0;
    nLoaded = 0;
    dc.loadMoreNew(1);
  }

  $(".nice-select.sorting li").each(function(){
    if($(this).attr("data-value") == 1){
      $(this).attr('onclick', () => {
        return "dc.sort('normal')";
      })
    }

    if($(this).attr("data-value") == 2){
      $(this).attr('onclick', () => {
        return "dc.sort('priceAsc')";
      })
    }

    if($(this).attr("data-value") == 3){
      $(this).attr('onclick', () => {
        return "dc.sort('priceDsc')";
      })
    }
  });

  insertProperty = (snippet, key, value) => {
    var pattern = "{{" + key + "}}";
    let tmp = snippet;
    tmp = tmp.replace(new RegExp(pattern, "g"), value);
    return tmp;
  }

  global.dc = dc;
})(window);