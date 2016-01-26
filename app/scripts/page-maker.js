/* jshint devel:true */
(function(){
	'use strict';
	var domId = 'content-left-inner';

/*
	var stories = [];
	var videos = [];
	var interactives = [];
	var photoslides = [];
*/
	var dataRules = {
		'lists': 'array',
		'items': 'item'
	};

	var thisday = new Date();
	var thenow = thisday.getHours() * 10000 + thisday.getMinutes() * 100 + thisday.getSeconds();
	var todaydate = thisday.getFullYear() + '-' + (thisday.getMonth() + 1) + '-' + thisday.getDate();

	var gApiUrls = {
		'home': 'api/page/home.json',
		'stories': '/falcon.php/homepage/getstoryapi/' + todaydate + '?' + thenow
	};

	var gApiUrlsLocal = {
		'home': 'api/page/home.json',
		'stories': 'api/page/stories.json'
	};

	if (window.location.hostname === 'localhost' || window.location.hostname.indexOf('192.168') === 0 || window.location.hostname.indexOf('10.113') === 0 || window.location.hostname.indexOf('127.0') === 0) {
		gApiUrls = gApiUrlsLocal;
	}

	//drag and drop
	var dragSrcEl = null;
	var dragIndex;
	var dragOverIndex;
	$('body').on('dragstart', '.item, .section-header, .lists-header' ,function(e){
		try {
			e.originalEvent.dataTransfer.setData('text/plain', 'anything');
		} catch (ignore) {

		}
		if ($(this).hasClass('item')) {
			$(this).css('opacity','0.4');
		} else if ($(this).hasClass('section-header')) {
			$('.sections .section-container').each(function(index){
				$(this).attr('data-order', index);
			});
			$(this).parentsUntil('.section-container').parent().css('opacity', '0.4');
			dragIndex = $(this).parentsUntil('.section-container').parent().attr('data-order');
			dragIndex = parseInt(dragIndex, 10); 
		} else if ($(this).hasClass('lists-header')) {
			$('.lists-item').each(function(index){
				$(this).attr('data-order', index);
			});
			$(this).parent().css('opacity', '0.4');
			dragIndex = $(this).parent().attr('data-order');
			dragIndex = parseInt(dragIndex, 10);
		}
		dragSrcEl = $(this);
	});

	$('body').on('dragend', '.item, .section-header, .lists-header' ,function(e){
		if ($(this).hasClass('item')) {
			$('.item').css('opacity','1');
		} else if ($(this).hasClass('section-header')) {
			$(this).parentsUntil('.section-container').parent().css('opacity', '1');
		} else if ($(this).hasClass('lists-header')) {
			$(this).parent().css('opacity', '1');
		}
		// remove visual feedbacks
		$('.over').removeClass('over');
		$('.over-drag-down').removeClass('over-drag-down');
		$('.over-drag-up').removeClass('over-drag-up');
	});

	$('body').on('dragenter', '.item, .lists-item>.meta-table, .lists-item>.lists-header, .section-container, .lists-item, .section-inner>.meta-table, .section-header',function(e){
		if (dragSrcEl.hasClass('item') && $(this).is('.item, .lists-item>.meta-table, .lists-item>.lists-header')) {
			$(this).addClass('over');
		} else if (dragSrcEl.hasClass('section-header') && $(this).hasClass('section-container')) {
			dragOverIndex = $(this).attr('data-order');
			dragOverIndex = parseInt(dragOverIndex, 10);
			if (dragIndex < dragOverIndex) {
				$(this).addClass('over-drag-down');
			} else if (dragIndex > dragOverIndex) {
				$(this).addClass('over-drag-up');
			}
		} else if (dragSrcEl.hasClass('lists-header') && $(this).is('.lists-item, .section-inner>.meta-table, .section-header')) {
			if ($(this).hasClass('lists-item')) {
				dragOverIndex = $(this).attr('data-order');
				dragOverIndex = parseInt(dragOverIndex, 10);
				if (dragIndex < dragOverIndex) {
					$(this).addClass('over-drag-down');
				} else if (dragIndex > dragOverIndex) {
					$(this).addClass('over-drag-up');
				}
			} else {
				$(this).addClass('over');
			}
		}
	});

	$('body').on('dragover', '.item, .lists-item>.meta-table, .lists-item>.lists-header, .section-container, .lists-item, .section-inner>.meta-table, .section-header' ,function(e){
		if (e.preventDefault) {
			e.preventDefault(); // Necessary. Allows us to drop.
		}
		if (dragSrcEl.hasClass('item') && $(this).is('.item, .lists-item>.meta-table, .lists-item>.lists-header')) {
			$(this).addClass('over');
		} else if (dragSrcEl.hasClass('section-header') && $(this).hasClass('section-container')) {
			dragOverIndex = $(this).attr('data-order');
			dragOverIndex = parseInt(dragOverIndex, 10);
			if (dragIndex < dragOverIndex) {
				$(this).addClass('over-drag-down');
			} else if (dragIndex > dragOverIndex) {
				$(this).addClass('over-drag-up');
			}
		} else if (dragSrcEl.hasClass('lists-header') && $(this).is('.lists-item, .section-inner>.meta-table, .section-header')) {
			if ($(this).hasClass('lists-item')) {
				dragOverIndex = $(this).attr('data-order');
				dragOverIndex = parseInt(dragOverIndex, 10);
				if (dragIndex < dragOverIndex) {
					$(this).addClass('over-drag-down');
				} else if (dragIndex > dragOverIndex) {
					$(this).addClass('over-drag-up');
				}
			} else {
				$(this).addClass('over');
			}
		}
	});

	$('body').on('dragleave', '.item, .lists-item>.meta-table, .lists-item>.lists-header, .section-container, .lists-item, .section-inner>.meta-table, .section-header' ,function(e){
		if (e.preventDefault) {
			e.preventDefault(); // Necessary. Allows us to drop.
		}
		$(this).removeClass('over').removeClass('over-drag-up').removeClass('over-drag-down');
	});

	$('body').on('drop', '.item, .lists-item>.meta-table, .lists-item>.lists-header, .section-container, .lists-item, .section-inner>.meta-table, .section-header' ,function(e){
		if (e.stopPropagation) {
			e.stopPropagation(); // stops the browser from redirecting.
		}
		if (e.preventDefault) {
			e.preventDefault(); // Necessary. Allows us to drop.
		}
		// Don't do anything if dropping the same column we're dragging.
		if (dragSrcEl.hasClass('item') && $(this).is('.item, .lists-item>.meta-table, .lists-item>.lists-header')) {
			if (dragSrcEl != this) {
				if ($(this).hasClass('item') === true) {
					dragSrcEl.insertAfter($(this));
				} else {
					$(this).parent().find('.lists-container').eq(0).prepend(dragSrcEl);
				}
			}
		} else if (dragSrcEl.hasClass('section-header')) {
			// drop a section. The drop point could be the container or its inner elements
			if ($(this).hasClass('section-container')) {
				dragOverIndex = $(this).attr('data-order');
				dragOverIndex = parseInt(dragOverIndex, 10);
				if (dragIndex < dragOverIndex) {
					$('.section-container').eq(dragIndex).insertAfter($(this));
				} else if (dragIndex > dragOverIndex) {
					$('.section-container').eq(dragIndex).insertBefore($(this));
				}
			} else if ($(this).is('.section-container .item, .lists-item>.meta-table, .lists-item>.lists-header')) {
				dragOverIndex = $(this).parentsUntil('.section-container').parent().attr('data-order');
				dragOverIndex = parseInt(dragOverIndex, 10);
				if (dragIndex < dragOverIndex) {
					$('.section-container').eq(dragIndex).insertAfter($('.section-container').eq(dragOverIndex));
				} else if (dragIndex > dragOverIndex) {
					$('.section-container').eq(dragIndex).insertBefore($('.section-container').eq(dragOverIndex));
				}
			}
		} else if (dragSrcEl.hasClass('lists-header')) {
			//console.log (this.classList);
			// drop a list. The drop point could be a container or any inner elements
			if ($(this).is('.item')) {
				// drop to an item
				dragOverIndex = $(this).parentsUntil('.lists-item').parent().attr('data-order');
				dragOverIndex = parseInt(dragOverIndex, 10);
				if (dragIndex < dragOverIndex) {
					$('.lists-item').eq(dragIndex).insertAfter($('.lists-item').eq(dragOverIndex));
				} else if (dragIndex > dragOverIndex) {
					$('.lists-item').eq(dragIndex).insertBefore($('.lists-item').eq(dragOverIndex));
				}
			} else if ($(this).is('.lists-item>.meta-table, .lists-item>.lists-header')) {
				// drop to list header or list meta table
				dragOverIndex = $(this).parent().attr('data-order');
				dragOverIndex = parseInt(dragOverIndex, 10);
				if (dragIndex < dragOverIndex) {
					$('.lists-item').eq(dragIndex).insertAfter($('.lists-item').eq(dragOverIndex));
				} else if (dragIndex > dragOverIndex) {
					$('.lists-item').eq(dragIndex).insertBefore($('.lists-item').eq(dragOverIndex));
				}
			} else if ($(this).is('.section-inner>.meta-table, .section-inner>.section-header')) {
				// console.log (this.classList);
				if ($(this).parentsUntil('.section-container').parent().hasClass('type-block')) {
					$(this).parent().find('.lists-container').eq(0).prepend($('.lists-item').eq(dragIndex));
				} else {
					alert ('A list can only be dropped to a block section! ');
				}
			} else {
				console.log (this.classList);
				console.log ('other situation...');
			}
		}
		dragSrcEl = null;
		return false;
	});
	
	$('body').on('click', '.tab', function(){
		$('html').removeClass('show-all').removeClass('show-sections').removeClass('show-items');
		if ($(this).hasClass('all')) {
			$('html').addClass('show-all');
		} else if ($(this).hasClass('sections')) {
			$('html').addClass('show-sections');
		} else if ($(this).hasClass('items')) {
			$('html').addClass('show-items');
		}
	});

	$('body').on('click', '.less', function(e){
		$('html').addClass('hide-info');
	});

	$('body').on('click', '.more', function(e){
		$('html').removeClass('hide-info');
	});

	function renderItem(data) {
		var dataHTML = '<div draggable=true data-type="story" class="item story" data-id="' + data.id + '">' + data.headline + '</div>';
		return dataHTML;
	}

	function renderMeta(data) {
		var metaHTML = '';
		var dataHTML = '';
		$.each(data, function(key, value){
			var arrayMeta = '';
			if (dataRules[key] === 'array' || dataRules[key] === 'item' ) {
				$.each(value, function(k, v){
					var title = v.title || v.name || v.type || 'List';
					if (dataRules[key] === 'array') {
						arrayMeta = renderMeta(v);
						dataHTML += '<div class="'+ key +'-item"><div class="'+ key +'-header" draggable=true>' + title + '</div>' + arrayMeta + '</div>';
					} else {
						arrayMeta = renderItem(v);
						dataHTML += arrayMeta;
					}
				});
			} else {
				metaHTML += '<tr class="meta-item"><td class="first-row"><input class="o-input-text" value="' + key + '"></td><td><input class="o-input-text" value="' + value + '"></td></tr>';
			}
		});
		dataHTML = '<div class="lists-container">' + dataHTML + '</div>';
		metaHTML = '<table class="meta-table">' + metaHTML + '</table>';
		return metaHTML + dataHTML;
	}

	function renderJson(jsonData) {
		//render meta data into HTML Dom
		var metaHTML = '';
		metaHTML = renderMeta(jsonData.meta);

		//render sections into HTML Dom
		var sectionsHTML = '';
		$.each(jsonData.sections, function(key, value){
			var sectionMeta = renderMeta(value);
			var title = value.title || value.name || value.type || 'Section';
			var sectionType = value.type || '';
			sectionType = (sectionType !== '') ? 'type-' + sectionType: '';
			sectionsHTML += '<div class="section-container '+ sectionType + '"><div class="section-inner"><div class="section-header" draggable=true>' + title + '</div>' + sectionMeta + '</div></div>';
		});
		sectionsHTML = '<div class="sections">' + sectionsHTML + '</div>';


		$('#'+domId).html(metaHTML + sectionsHTML);
	}

	function jsonToDom(jsonUrl) {
		$.ajax({ 
		    type: 'get', 
		    url: jsonUrl, 
		    dataType: 'json', 
		    success: function (data) { 
		        renderJson(data);
		    }, 
		    error: function (XMLHttpRequest, textStatus, errorThrown) { 
		            alert(errorThrown); 
		    } 
		});
	}

	function loadStories() {
		$.ajax({ 
		    type: 'get', 
		    url: gApiUrls.stories, 
		    dataType: 'json', 
		    success: function (data) {
		    	var storiesInner = '';
		    	var photosInner = '';
		    	var interactivesInner = '';
		    	var videosInner = '';
		        $.each(data, function (entryIndex, entry) {
		        	if (entry.id) {
		        		//console.log (entry.cheadline);
		        		storiesInner += '<div draggable=true data-type="story" class="item story" data-id="' + entry.id + '">' + entry.cheadline + '</div>';
		        	} else if (entryIndex === 'photonews'){
		        		$.each(entry, function (photoIndex, photo) {
		        			photosInner += '<div draggable=true data-type="photo" class="item photo" data-id="' + photo.photonewsid + '">' + photo.cn_title + '</div>';
		        		});
		        	} else if (entryIndex === 'interactive'){
		        		$.each(entry, function (interactiveIndex, interactive) {
		        			interactivesInner += '<div draggable=true data-type="interactive" class="item interactive" data-id="' + interactive.id + '">' + interactive.cheadline + '</div>';
		        		});
		        	} else if (entryIndex === 'video'){
		        		$.each(entry, function (videoIndex, video) {
		        			videosInner += '<div draggable=true data-type="video" class="item video" data-id="' + video.id + '">' + video.cheadline + '</div>';
		        		});
		        	}
		        });
		        $('#stories-inner').html(storiesInner + videosInner + interactivesInner + photosInner);
		    }, 
		    error: function (XMLHttpRequest, textStatus, errorThrown) { 
		        console.log(errorThrown); 
		    } 
		});
	}

/*

	function searchstory(thedate, ro) {
    var ro;
    $("#runningorder").attr("href", "http://www7.ftchinese.com/m/corp/runningorder.html?thedate=" + thedate);
    $("#stories div").empty();
    var thisday1 = new Date();
    var thenow1 = thisday1.getHours() * 10000 + thisday1.getMinutes() * 100 + thisday1.getSeconds();
    $.getJSON("/falcon.php/homepage/getstoryapi/" + thedate + "/" + thenow1, function (data) {
        $("#stories div").empty();
        var existingstories = "";
        $.each($("#thecodes textarea"), function () {
            if ($(this).attr("id") != "codeechostoryid") {
                existingstories += this.value;
            }
        });

        $.each(data, function (entryIndex, entry) {
            if (entry['id']) {
                eval("myStories[\"" + entry['id'] + "\"]=entry");
                var grey;

                if (existingstories.indexOf(entry['id']) > 0) {
                    grey = " style=\"color:#ccc\"";
                }
                var html = '<div class=hc>';
                html += '<a title=\"插入文章但不添加相关新闻\" class=hl priority=' + entry['priority'] + ' ' + grey + ' id=' + entry['id'] + ' onclick=\"insertstory(\'' + entry['id'] + '\')\"> ';
                html += entry['priority'] + '. '
            html += entry['cheadline'] + '</a>';
        html += '<span> <a target=_blank href=/falcon.php/story/edit/' + entry['id'] + '>edit</a>|<a target=_blank href=/create_story.php?id=' + entry['id'] + '>old</a>|<a target=_blank href=http://www7.ftchinese.com/story/' + entry['id'] + '?preview=1>view</a>';
        html += '| <a title=\"插入文章并添加一条相关新闻\" class=tail onclick=\"insertstory(\'' + entry['id'] + '\',1)\"> 1 </a> ';
        html += '<a title=\"插入文章并添加两条相关新闻\" class=tail onclick=\"insertstory(\'' + entry['id'] + '\',2)\"> 2 </a> ';
        html += '<a title=\"插入文章并添加三条相关新闻\" class=tail onclick=\"insertstory(\'' + entry['id'] + '\',3)\"> 3 </a> ';
        html += '<a title=\"插入文章并添加所有相关新闻\" class=tail onclick=\"insertstory(\'' + entry['id'] + '\',10)\"> N </a>';
        html += '</span></div>';

        if (entry['priority'] > 0 && entry['priority'] <= 9) {
            $('#thecover').append(html);
        } else if (entry['priority'] >= 10 && entry['priority'] <= 19) {
            $('#theskyline').append(html);
        } else if (entry['priority'] >= 20 && entry['priority'] <= 49) {
            $('#theleft').append(html);
        } else if (entry['priority'] >= 49 && entry['priority'] <= 69) {
            $('#theright').append(html);
        } else if (entry['genre'].toLowerCase().indexOf("news") >= 0 && entry['area'].toLowerCase().indexOf("china") >= 0) {
            $('#thechina_news').append(html);
        } else if (entry['genre'].toLowerCase().indexOf("news") >= 0) {
            $('#theworld_news').append(html);
        } else if (entry['cheadline'].toLowerCase().indexOf("lex") >= 0) {
            $('#thelex').append(html);
        } else if (entry['genre'].toLowerCase().indexOf("column") >= 0) {
            $('#thecolumn').append(html);
        } else if (entry['genre'].toLowerCase().indexOf("analysis") >= 0) {
            $('#theanalysis').append(html);
        } else if (entry['topic'].toLowerCase().indexOf("lifestyle") >= 0) {
            $('#thelifestyle').append(html);
        } else if (entry['genre'] == "feature") {
            $('#thefeature').append(html);
        } else if (entry['genre'] == "editorial") {
            $('#theeditorial').append(html);
        } else if (entry['genre'] == "comment") {
            $('#thecomment').append(html);
        } else if (entry['genre'] == "sod") {
            $('#thesod').append(html);
        } else {
            $('#theother').append(html);
        }
            } else if (entryIndex == "video") {
                $.each(entry, function (ek, ev) {
                    //alert (ev['id']);
                    eval("myStories[\"" + ev['id'] + "\"]=ev");
                    var grey;

                    if (existingstories.indexOf(ev['id']) > 0) {
                        grey = " style=\"color:#ccc\"";
                    }
                    var html = '<div class=hc>';
                    html += '<a ' + grey + ' id=' + ev['id'] + ' onclick=\"insertstory(\'' + ev['id'] + '\')\"> ';
                    html += ev['cheadline'] + '</a>';
                    html += '<span> <a target=_blank href=/create_videostory.php?id=' + ev['id'] + '>edit</a>|<a target=_blank href=http://www.ftchinese.com/video/' + ev['id'] + '>view</a>';
                    html += '</span></div>';


                    $('#thevideo').append(html);


                });


            } else if (entryIndex == "interactive") {
                $.each(entry, function (ik, iv) {
                    //alert (iv['id']);
                    eval("myStories[\"" + iv['id'] + "\"]=iv");
                    var grey = "";
                    if (existingstories.indexOf("interactive/"+iv['id']) > 0) {
                        grey = " style=\"color:#ccc\"";
                    }


                    var html = '<div class=hc>';
                    html += '<a ' + grey + ' id=' + iv['id'] + ' onclick=\"insertstory(\'' + iv['id'] + '\')\"> ';
                    html += iv['cheadline'] + '</a>';
                    html += '<span> <a target=_blank href=/falcon.php/ia/edit/' + iv['id'] + '>edit</a>|<a target=_blank href=http://www.ftchinese.com/interactive/' + iv['id'] + '>view</a>';
                    html += '<span></div>';


                    $('#theinteractive').append(html);


                });


            } else if (entryIndex == "photonews") {
                $.each(entry, function (ik, iv) {
                    //alert (iv['id']);
                    eval("myStories[\"" + iv['photonewsid'] + "\"]=iv");
                    var grey = "";
                    if (existingstories.indexOf("photonews/"+iv['en_title']) > 0) {
                        grey = " style=\"color:#ccc\"";
                    }


                    var html = '<div class=hc>';
                    html += '<a ' + grey + ' id=' + iv['photonewsid'] + ' onclick=\"insertphoto(\'' + iv['photonewsid'] + '\')\"> ';
                    html += iv['cn_title'] + '</a>';
                    html += ' <span><a target=_blank href=/falcon.php/pics/edit_photonews/' + iv['photonewsid'] + '>edit</a>|<a target=_blank href=http://www.ftchinese.com/photonews/' + iv['cn_title'] + '>view</a>';
                    html += '</span></div>';


                    $('#thephotonews').append(html);


                });


            }


        });

        $("#stories div[id^='the']").each(function () {
            $(this).prepend("<b>" + $(this).attr("id").replace(/the/, "").toUpperCase() + ":</b>");
        });


        if (ro == 1) {
            runthomas();
        }

        $(".hc span").hide();
        $(".hc").hover(
                function(){$(this).find("span").show();},
                function(){$(this).find("span").hide();}
                )

            //alert (myStories["001026878"].cheadline + myStories["001026878"].id);
    });
}

*/

	jsonToDom(gApiUrls.home);
	loadStories();

})(); 