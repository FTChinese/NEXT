# FTChinese Next Project
## Teams
### Design
1. Content Design: Site Navigation, Channel Setup, Home Page Layout and Sections
2. Visual Design: Layout, Color, Icon, Font, Styles, Components
3. UI Design: Function, User Interaction, Login, Register, Comments, Sharing

### Development
The development team will focus on achieving the highest possible performance, both on the front and back end. Special focus should be on three mission-critical pages. 

##Mission-critical pages
The home page, story page and channel page contributes more than 90% of the site traffic. These pages will be developed from scratch and their performance will be evaluated every week by the following list. The code should be reviewed at least every month. 

Here's the check list for mission-critical page performance: 

1. Get 100 points in Google's [Page Speed Insights](https://developers.google.com/speed/pagespeed/insights/). 
2. Core experience, as defined in [General Best Practice](http://origami.ft.com/docs/developer-guide/general-best-practices/) is available in the first request, without any external CSS and JS. 
3. First response is smaller than 14k. 
4. Use serviceworker correctly to cache assets and save time. 
5. Don't load custom web font for web page. 
6. Ad codes don't block critical content. 
7. Load as less as possible CSS and images on mobile (payment by traffic) by serving different mobile CSS and full CSS. 
8. Use placeholder, relative div and Responsive Image Service to load images and avoid reflow. 
9. Lazy-load images that are not in the first view. 
10. Check if CSS and JS is loaded successfully and fall back when CDN fails. 
11. Use Preconnect to speed up asset loading. 


## Reference
* [Origami Example](http://origami.ft.com/docs/developer-guide/using-modules/)
* [General Best Practice](http://origami.ft.com/docs/developer-guide/general-best-practices/)
* [Under Standing Critical CSS](http://www.smashingmagazine.com/2015/08/understanding-critical-css/)
* [CSS and Critical Path](https://speakerdeck.com/patrickhamann/css-and-the-critical-path)
* [Google Web Fundamentals](https://developers.google.com/web/fundamentals/)