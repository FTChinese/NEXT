# FTChinese Next Project

## Our Goal
1. Redesign the www.ftchinese.com for best content display on all devices. 
2. Upgrade the performance of the web site, especially mission-critical pages, to the highest standard. 
3. Streamline editorial workflow so that our editors can update content and page as fast as possible. 
4. Embrace HTML 5 in our advertisements to delivery high-quality ad display and maximize ad performance. 
5. Promote our own growth and monetizing efforts. 
6. All pages, not just home, should be managed in CMS without any tech knowledge. 

## Design
1. Content Design: Site Navigation, Channel Setup, Home Page Layout and Sections
2. Visual Design: Layout, Color, Icon, Font, Styles, Components
3. UI Design: Function, User Interaction, Login, Register, Comments, Sharing

## Development
The development team will focus on achieving the highest possible performance, both on the front and back end. Special focus should be on three mission-critical pages. 

## Mission-critical pages
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
11. Use Preconnect or Prefetch to speed up asset loading. 
    <link href="http://static.ftchinese.com/" rel="preconnect" crossorigin>


## Reference
* [Origami Example](http://origami.ft.com/docs/developer-guide/using-modules/)
* [General Best Practice](http://origami.ft.com/docs/developer-guide/general-best-practices/)
* [Under Standing Critical CSS](http://www.smashingmagazine.com/2015/08/understanding-critical-css/)
* [CSS and Critical Path](https://speakerdeck.com/patrickhamann/css-and-the-critical-path)
* [Google Web Fundamentals](https://developers.google.com/web/fundamentals/)


## Projects
The projects are prioritized based on importance and dependency. 

### Story Page
Over 40% of our traffic comes from story page. So it's at least as important as the home page. When users share our content on mobile, they share story page. So it's important to design and develop both for mobile and PC. Since the page is mostly static content, we must make sure it loads instantly by strictly following our performance principles. Special attention should be paid when users open the story page in an app, rather than a browser. 

### Home Page
We need to design both the home page and the editorial tools for updating the home page. The home page should be designed to be responsive. Editors should be able to focus on the content itself, rather than tinkering with the layout and style. It should also load instantly even on slow connection. It also need to be able to deliver more ad inventories without being noisy and cluttered. 

Requirements from Feng: 
1. Desktop and Mobile app should have different story lists on home page. 
2. 

### Channel
We need to design both the navigation content and the channel pages. Channel pages should be have varying layout and content policy, which is configurable in CMS. 

### Tag, Topic and Special Report
Tag and Special Report pages should be configurable in the CMS so that we can instantly create new pages to bring in traffic and revenue. 
1. All the pages should be managed in CMS. 


### Column
Although traffic to these pages are quite low, columnists are very important to our site. The invidual columnist page is already configurable in CMS. We need to come up with a better design and better features. For example, some columnists might want to maintain their own column pages by syncing their social networks. However, the collection of all columnists page needs a totally new design. 

### MyFT
The user should be able to follow topics, tags, authors, columns, etc... They are already able to save an article. We also need to have a feature of "articles that I read". Users should be able to receive notification for topics that they followed, both on their mobile phones and chrome. 

### APIs

### Users
1. Subscription


### Ad
Ad units should be simple and backward compatible. I suggest that we should have two types of basic ad units: MPU and Banner. Then clients can pay extra money for enhanced display, like full page and expandable. The advertisement should be responsive, adapting to any environment. In order to show the clients how HTML 5 works, we should use our own house ad to showcase what's possible. We will also implement stricter security requirements to advertisements. 

### Registration Page

### Video

### Interactive

### Search

### Photo Slides

### User Profile

### Marketing

### Information

### Error

### User Comments

### Jobs

### Find Password

### Events
