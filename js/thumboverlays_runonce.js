// Using the closure to map jQuery to $. 
(function ($) {

var VIDEOS_FIELD_NAME = "field-wall-videos";
var IMAGES_FIELD_NAME = "field-wall-images";


/*************************************************/

 
  // If a video and thumbnail share a filename, then flag them with classes
  
/***
*  Our current use-case for a project is that a video has to have an associaed thumbnail.
*  Until better options present themselves, we'll be using filenames to identify whether an uploaded
*  image is a thumbnail for a video based on identical (excluding extension filenames.

*  This is a simplified version of thumboverlays.js because the constant repetition isn't necessary
*  This also accounts for different methods of DOm element detection for the view of a node.
*
****/
  
  
Drupal.behaviors.detectRelatedOnce = {
      attach: function (context, settings) {  
         matchChecks(context, settings);
      }  
  };
  

/***
*  This function is endless because it'll be getting called endlessly on a given node form this
*  file is included on.  Should be a hint not to include this anywhere you don't want this behavior.
*
*  We'll be clearing any existing formatting on the videos and images (that we've placed) and re-
*  applying them as necessary each pass over the DOM.
*   
*  This is sort of garbage and should be handled by Drupal.behaviors' attach but Media Module
*  never calls attach when it dynamically updates the page.
***/

function matchChecks(context, settings) {
   var videofield = $('.field-name-'+VIDEOS_FIELD_NAME, context);
   var imagefield = $('.field-name-'+IMAGES_FIELD_NAME, context);
   
   var videos = $('.field-item .file', videofield);
   var images = $('.field-item img', imagefield);
   //unFlagFiles(videos, images);
   flagMatchedFiles(videos, images);
} 

/***
*  Go through each videos object and images object and get rid of our styles and any overlay divs
*  we've made.  
***/
function unFlagFiles(videos, images) {
   $.each(videos, function(key, video) {
      //unstyleVideoThumb(video, "matched");
      clearThumbOverlay(video);
      clearThumbOverlay(video, "thumbnail-matched");
      clearThumbOverlay(video, "thumbnail-missing");
   });
      
   $.each(images, function(key, image) {
      unstyleVideoThumb(image, "matched");
   });
} 

/****
*  Function is a little messy because it has gone through a few different goals.  
*  Currently:  If a video has the same name as an image, overlay that image as a thumbnail on
*  the video.
*     Also, if a video has no matching thumbnail image then flag it with an error.
*
****/

function flagMatchedFiles(videos, images) {
   //assumes videos are a label, images are an img tag (for media module)
   var tagVideos = new Array();
   //var tagImages = new Array();
   var vidThumbs = new Array();
   var thumbs = new Array();
   var matchFound = false;
   
   //Walk through the video array, checking the image array for each video before moving
   // to the next vid
   $.each(videos, function(key, video) {
      var videoname = extractVidName(video);
      //search for related image
      $.each(images, function(ikey, image) {
         var imagename = image.src.replace(/.*\//,''); //get base filename
         //replace bothersome %20 with spaces
         imagename = imagename.replace(/%20/,' ');
         imagename = imagename.substr(0, imagename.lastIndexOf('.'));
         if (videoname == imagename) {
//            tagVideos.push(video);
//            tagImages.push(image);
            vidThumbs.push(video);
            //The actual thumbnail is in front of this image element.
            var actualThumb = getThumbnail(image);
            thumbs.push(actualThumb);            
            matchFound = true;
         }
      }); 
      //end search for related image
      
      if (!matchFound) 
         tagVideos.push(video);
      matchFound = false;  //reset flag
   });
   //This loop is used to keep track of vids that need to be marked as error
   for (x in tagVideos) {
//      styleVideoThumb(tagVideos[x], "matched");
      addThumbOverlay(tagVideos[x], "notfound.png", "thumbnail-missing");
   }
   //This loop isn't used, but would mark a thumbnail image that matched a video
/*   for (x in tagImages) {
      styleImageThumb(tagImages[x], "matched");
   } */
   
   //This loop is used to add thumbnail overlays to videos with matching image thumbnails
   for (x in vidThumbs) {
      var temp = thumbs[x];
      addThumbOverlay(vidThumbs[x], thumbs[x].src, "thumbnail-matched");
   }
   
}


function getThumbnail(image) {
   //find the thumbnail of this given image.
   //This can vary greatly depending on our module usage.
   return image;
}


/***
** Returns strings
**
**/
function extractVidName(video) {
   var tempname = $('a', video).text();
   return tempname.substr(0, tempname.lastIndexOf('.'));
}

function extractImgName(image) {
   var tempname = $('a', image).text();
   return tempname.substr(0, tempname.lastIndexOf('.'));
}

/***
*  Thumbnail overlay functions.  Not a lot to document here.
*  This depends on the specific module we're using to work.
*
***/
function addThumbOverlay(div,overlayImage, classname) {
   var prepend = '';
   //An image might be a complete URL, so we need to account for this.
   //Doesn't currently account for other URL information and makes assumptions about module paths
   //@TODO: Add module behavior that puts the module path into Drupal.settings and reference it
   if (overlayImage.search(/^http/) < 0) {
      prepend = Drupal.settings.basePath+Drupal.settings.thumboverlays.path;
   }
   //Special handling because 
   //if (classname = "thumbnail-matched")
   $(div).children('a').before('<span class="'+classname+'"><img src="'+prepend+overlayImage+'" /></span>');
}

function clearThumbOverlay(div, classname) {
   if (typeof(classname) == undefined)
      classname = '.image-matched';
   $(div).children(classname).remove();
}

function styleVideoThumb(video, classname) {
   $(video).parents('.media-item').addClass(classname);
}

function styleImageThumb(image, classname) {
   $(image).parents('.media-item').addClass(classname);
}

function unstyleVideoThumb(video, classname) {
   $(video).parents('.media-item').removeClass(classname);
}

function unstyleImageThumb(image, classname) {
   $(image).parents('.media-item').removeClass(classname);
}
  
}(jQuery));