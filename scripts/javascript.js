//////////////////////// JAVASCRIPT FOR GIFT GUIDE 2014 /////////////////////

//Preserve category and price selections as global variables
var category = "*";
var max_price = "*";
var app = {

	init: function(){

		app.populate_gifts();
		app.gift_hover();
		app.isotope();

		app.toggle_lightbox();
		app.place_lightbox();

		app.load_sharebox();
		app.toggle_sharebox();

		app.share_gift();
		app.share_page();
		
		app.mobile_filters();
	},

	populate_gifts: function(){


		var code = "";
		var cost_class;
		for (var key in gifts){
			code += '<div class="gift '+gifts[key].category+'" data-cost="'+gifts[key].cost+'" data-hash="'+gifts[key].photo_url+'"> <div class="gift-name" data-brand="'+gifts[key].location+'">'+gifts[key].product_name+'</div><div class="gift-more">READ MORE</div><div class="gift-social"><span class="icon-facebook"></span><span class="icon-twitter"></span></div><img src="images/gifts/'+gifts[key].photo_url+'.jpg" /></div>';
		}

		//$("#gifts").append(code);
		var $gifts = $(code);
		$("#gifts").isotope( 'insert', $gifts );
		
		$("#gifts").imagesLoaded( function() {
			$("#lb-overlay").removeClass("loading");
			$("#gift-loader").removeClass("visible");
			$("#gifts").isotope("reLayout");
		});

	},

	gift_hover: function(){


		$(".gift").hover(function(){

			//Show name and brand
			$(this).find(".gift-name").addClass("visible");

			//Show read more
			$(this).find(".gift-more").addClass("visible");

			//Show social tools
			$(this).find(".gift-social").addClass("visible");

		}, function(){

			//Hide name and brand			
			$(this).find(".gift-name").removeClass("visible");

			//Hide read more
			$(this).find(".gift-more").removeClass("visible");

			//Hide social tools
			$(this).find(".gift-social").removeClass("visible");

		});

	},

	isotope: function(){

		//Filtering

		$(".filters ul li").on("click", function(){

			//Update styles, just for this group
			$(this).parent().find("li").removeClass("selected");
			$(this).addClass("selected");

			//Isotope action
			// var selector = $(this).attr('data-filter');
			// $container.isotope({ filter: selector });
			// return false;

			//Update global variables tracking chosen category and price range
			if ($(this).parent().parent().attr("id") === "categories"){
				category = $(this).attr('data-filter');
			} else {
				max_price = $(this).attr('data-filter');
			}

			//Isotope action
			$container.isotope({
				filter: function() {
					var number = $(this).attr("data-cost");
					if (max_price === "*"){ //Returns true for all prices
						if ($(this).hasClass(category) || category === "*"){ //Must match the chosen category, unless no category was selected
							return true;
						}
					} else { 
						if ($(this).hasClass(category) || category === "*"){  //Must match the chosen category, unless no category was selected
							return parseInt( number, 10 ) <= Number(max_price); //Returns true just for items less than or equal to chosen max price
						} else {
							return false;
						}
					}
				}
			});
			return false;

		});


	},

	populate_lightbox: function(info){

		//Update photo
		$("#lb-image").css("background-image","url('images/gifts/"+info[0].photo_url+".jpg')")

		//Update name
		$("#lb-name").html(info[0].product_name);

		//Update brand
		$("#lb-brand").html(info[0].location);

		//Update price

			//If cost has a trailing zero after a decimal, we need to add it back in manually
			var cost = info[0].cost.toString();
			if (cost.charAt(cost.length - 2) === "."){
				cost += "0";
			}

		$("#lb-price span").html(cost);


		//Update description
		$("#lb-desc").html(info[0].description);

		//Update link
		$("#lb-link a").attr("href",info[0].buy_url);

		//Store slug (using photo_url) to populate custom shareable URLs
		$("#lb-social").attr("data-hash",info[0].photo_url);

	},

	toggle_lightbox: function(){

		$(".gift").on("click", function(){
			
			//Populate lightbox with gift info

			var name = $(this).find(".gift-name").text();
			var info = $.grep(gifts, function(e){
					return (e.product_name === name)
				});

			app.populate_lightbox(info);

			//Open lightbox when any gift is clicked
			$("#lb-overlay").addClass("visible");
			$("#lightbox").addClass("visible");

			updateOmniture();

		});

		//Close lightbox when the "X" or the overlay is clicked 
		$("#lb-close").on("click", function(){
			$("#lb-overlay").removeClass("visible");
			$("#lightbox").removeClass("visible");
		});

		$("#lb-overlay").on("click", function(){
			$("#lb-overlay").removeClass("visible");
			$("#lightbox").removeClass("visible");
		});

	},

	place_lightbox: function(){

		//Center the lightbox based on the window size

		//Grab panel width
		var panel_width = $("#panel").css("width")
		
		//Drop the "px" or test for "100%", which indicates mobile and thus it is no longer part of the calculation
		if (panel_width.slice(-2) === "px")
			panel_width = panel_width.slice(0,-2);

		if (Number(panel_width) > 306)
			panel_width = 0;

		//Grab lightbox dimensions
		var lb_width = $("#lightbox").width();
		var lb_height = $("#lightbox").height();

		//Calculate new positions
		var top = (window.innerHeight - Number(lb_height))/2;
		var left = (window.innerWidth - Number(panel_width) - Number(lb_width))/2 + Number(panel_width);

		//Apply positions
		$("#lightbox").css("top", top+"px").css("left", left+"px");

	},

	load_sharebox: function(){

		//Only load the sharebox if there is a hash matching a gift
		var hash = location.hash.slice(1);

		//The hash is populated by the same slug as the photo url; locate info by matching this
		var info = $.grep(gifts, function(e){
				return (e.photo_url === hash);
			});

		if (typeof info[0] != "undefined" && typeof info[0] != undefined){

			//Display sharebox
			$("#sharebox").addClass("visible");

			//Populate sharebox with chosen info
			app.populate_sharebox(info);

		}

	},

	populate_sharebox: function(info){

		//Update photo
		$("#sb-image").css("background-image","url('images/gifts/"+info[0].photo_url+".jpg')")

		//Update name
		$("#sb-name").html(info[0].product_name);

		//Update brand
		$("#sb-brand").html(info[0].location);

		//Update price
		$("#sb-price span").html(info[0].cost);

		//Update description
		$("#sb-desc").html(info[0].description);

		//Update link
		$("#sb-link a").attr("href",info[0].buy_url);

	},

	toggle_sharebox: function(){

		$("#sb-close").on("click", function(){
			$("#sharebox").removeClass("visible");
		});

	},

	tweet_item: function(hash){

			var tweet = "Check out what I found on Baltimore Sun's Gift Guide"; //Tweet text
			var url = "http://data.baltimoresun.com/gift-guide-2016/index.html%23" + hash;

			var twitter_url = "https://twitter.com/intent/tweet?text="+tweet+"&url="+url+"&tw_p=tweetbutton";
			window.open(twitter_url, 'mywin','left=200,top=200,width=500,height=300,toolbar=1,resizable=0'); return false;

	},

	facebook_item: function(hash, product, brand){

		var picture = "http://data.baltimoresun.com/gift-guide-2016/images/gifts/"+hash+".jpg"; //Picture URL
		var title = "Gift Guide 2014"; //Post title

		//Escape any ampersands with URL encoding
		product = product.replace("&","%26");
		brand = brand.replace("&","%26");

		var description = "Check out what I found on Baltimore Sun's Gift Guide: "+product+" at "+brand; //Post description
		var url = "http://data.baltimoresun.com/gift-guide-2016/index.html%23" + hash;

		var facebook_url = "https://www.facebook.com/dialog/feed?display=popup&app_id=310302989040998&link="+url+"&picture="+picture+"&name="+title+"&description="+description+"&redirect_uri=http://data.baltimoresun.com";    		
		window.open(facebook_url, 'mywin','left=200,top=200,width=500,height=300,toolbar=1,resizable=0'); return false;

	},

	pin_item: function(hash, product, brand){

	    var url = "http://data.baltimoresun.com/gift-guide-2016%23"+hash;
		var picture = "http://data.baltimoresun.com/gift-guide-2016/images/gifts-large/"+hash+".jpg"; //Picture URL
		var description = "Check out what I found on Baltimore Sun's Gift Guide: "+product+" at "+brand; //Pin description

		var pinterest_url = "https://www.pinterest.com/pin/create/button/?url="+url+"&media="+picture+"&description="+description;
		window.open(pinterest_url, 'mywin','left=200,top=200,width=500,height=300,toolbar=1,resizable=0'); return false;

	},

	share_gift: function(){

		$("#lb-social .icon-twitter").on("click", function(){

			var hash = $(this).parent().attr("data-hash");
			app.tweet_item(hash);

		});

		$("#lb-social .icon-facebook").on("click", function(){

			var hash = $(this).parent().attr("data-hash");
			var product = $(this).parent().parent().find("#lb-name").text();
			var brand = $(this).parent().parent().find("#lb-brand").text();
			app.facebook_item(hash, product, brand);

		});

		$("#lb-social .icon-pinterest").on("click", function(){

			var hash = $(this).parent().attr("data-hash");
			var product = $(this).parent().parent().find("#lb-name").text();
			var brand = $(this).parent().parent().find("#lb-brand").text();
			app.pin_item(hash, product, brand);

		});

	},

	mobile_filters: function(){

		$(".list-header-mobile span").on("click", function(){

			if (!$(this).hasClass("reverse")){
				
				//Update arrow direction
				$(".list-header-mobile span").removeClass("reverse");				
				$(this).addClass("reverse");

				//Show filters
				$(".filters ul").removeClass("visible");
				$(this).parent().parent().find("ul").addClass("visible");

			} else {

				//Update arrow direction
				$(".list-header-mobile span").removeClass("reverse");

				//Hide filters
				$(".filters ul").removeClass("visible");

			}

		});

		$(".filters ul li").on("click", function(){

			//Close filters when something is chosen
			$(".filters ul").removeClass("visible");
			$(".list-header-mobile span").removeClass("reverse");			

			//Update label text
			var text = $(this).data("label");
			$(this).parent().parent().find(".list-header-mobile span").html(text);

		});

	},

	share_page: function(){

		$("#share-tools .icon-twitter").on("click",function(){

			var tweet = "Don't stress - find the perfect gift with the Baltimore Sun gift guide."; //Tweet text
			var url = "http://data.baltimoresun.com/gift-guide-2016/";

			var twitter_url = "https://twitter.com/intent/tweet?text="+tweet+"&url="+url+"&tw_p=tweetbutton";
			window.open(twitter_url, 'mywin','left=200,top=200,width=500,height=300,toolbar=1,resizable=0'); return false;

		});

		$("#share-tools .icon-facebook").on("click",function(){

			var picture = "http://data.baltimoresun.com/gift-guide-2016/images/giftguide-fb-thumb.png"; //Picture URL
			var title = "Baltimore Sun Gift Guide"; //Post title
			var description = "Don't stress - find the perfect gift with the Baltimore Sun gift guide."; //Post description
			var url = "http://data.baltimoresun.com/gift-2016/";

	    	var facebook_url = "https://www.facebook.com/dialog/feed?display=popup&app_id=310302989040998&link="+url+"&picture="+picture+"&name="+title+"&description="+description+"&redirect_uri=http://data.baltimoresun.com";    		
			window.open(facebook_url, 'mywin','left=200,top=200,width=500,height=300,toolbar=1,resizable=0'); return false;

		});

	}
	
}


$(document).ready(function(){

	app.init();

});

$(window).resize(function(){

	app.place_lightbox();

});
