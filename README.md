# FTChinese Next Project

## Our Goal
1. Redesign the www.ftchinese.com for best content display on all devices. 
2. Upgrade the performance of the web site, especially mission-critical pages, to the highest standard. 
3. Streamline editorial workflow so that our editors can update content and page as fast as possible. All pages, not just home, should be managed in CMS without any tech knowledge. 
4. Embrace HTML 5 in our advertisements to delivery high-quality ad display and maximize ad performance. 
5. Kickstart our own growth and monetizing efforts, especially subscription business. 

## Time Table

| Date                | Mile Stone                                               |
|---------------------|----------------------------------------------------------|
| December 15th, 2015 | Infractures and development environment set up           |
| February 1st, 2016  | Story page complete                                      |
| March 1st 2016      | Home page and stream pages complete                      |
| April 15st 2016     | All pages and features on current site available on Next |
| May 4th 2016        | **Launch**                                               |
| July 1st 2016       | FTC site converted to NodeJS                             |
| September 1st, 2016 | MyFT                                                     |
| December 1st, 2016  | **Corporate subscription complete**                      |

## Roles and Responsibilities

### Designers
1. Visual Design: Layout, Color, Icon, Font, Styles, Components
2. UI Design: Function, User Interaction, Login, Register, Comments, Sharing

### Developers
The development team will focus on achieving the highest possible performance, both on the front and back end. Special focus should be on two mission-critical pages: story and stream. Home page is a stream page. 

When we launch the Next FTC, our front end code will be a total revamp. The server side will continue to use PHP, mysql and smarty until we can have a London developer to help us convert to NodeJS. After converting to NodeJS, we'll be able to use server side code developed by the London team, which makes it possible for the FTChinese to launch new features in sync with London. 

#### PHP Developers
1. Provide APIs. 
2. Handle traffi

#### Frontend Developers
1. The front end HTML, CSS and JavaScipt. 

#### Java Developer
Focus on android app, database and video. 

### Nextwork Engineers
1. Set up and maintain server and development environment. 
2. Switch the site to Next on the launch day. 
3. Monitor performance. 
4. Testing. 
5. Handle traffic and database related issues. 

## **Support from London**
The FTChinese current team will be able to launch the new Next site on its own, using existing technology. However, in order to upgrade beyond the launch, we need developers from London to help us with the following tasks: 
1. Switch to NodeJS on the server side, so that our site can support more active users per day, with the same resources. 
2. Develop MyFT and Subscription. 
3. Streamline our development tools and workflows. 
4. Integrate with London's developement team, code base and APIs. 
5. Train our developers. 

As the FT London will finish the Next FT in summer of 2016, their technology and experience will be suitable for the FTChinese when we upgrade our server side technology. Since we have very high standard both in terms of performance and code quality, outsourcing is not an option. 

## Mission-critical pages
The home page, story page and channel page contributes more than 90% of the site traffic. These pages will be developed from scratch and their performance will be evaluated every week by the following list. The code should be reviewed at least every month. 

Here's the check list for mission-critical page performance: 

1. Get 100 points in Google's [Page Speed Insights](https://developers.google.com/speed/pagespeed/insights/). 
2. Core experience, as defined in [General Best Practice](http://origami.ft.com/docs/developer-guide/general-best-practices/) is available in the first request, without any external CSS and JS. 
3. First response is smaller than 14k (after GZIP?). 
4. Use serviceworker correctly to cache assets and save time. 
5. Don't load custom Chinese web font for web page. 
6. Ad codes don't block critical content. 
7. Load as less as possible CSS and images on mobile (especially data which are paid by traffic) by serving different mobile CSS and full CSS. 
8. Use skeleton screens, placeholders, relative divs and Responsive Image Service to load images and avoid reflow. 
9. Lazy-load images that are not in the first view. 
10. Check if CSS and JS is loaded successfully and fall back when CDN fails. 
11. Use Preconnect and Prefetch to speed up asset loading. 
    `<link href="http://static.ftchinese.com/" rel="preconnect" crossorigin>`
12. Core static pages (home, story and channel) should render regardless of database condition. 


## Reference
* [Origami Example](http://origami.ft.com/docs/developer-guide/using-modules/)
* [General Best Practice](http://origami.ft.com/docs/developer-guide/general-best-practices/)
* [Under Standing Critical CSS](http://www.smashingmagazine.com/2015/08/understanding-critical-css/)
* [CSS and Critical Path](https://speakerdeck.com/patrickhamann/css-and-the-critical-path)
* [Google Web Fundamentals](https://developers.google.com/web/fundamentals/)
* [Embracing the Network](https://speakerdeck.com/patrickhamann/embracing-the-network-smashing-conf)


## Projects
The projects are prioritized based on importance and dependency. 

### Infrastructure
Server-side set up of next.ftchinese.com, including database, API, cache, template engine(Smarty 3), etc... On the launch day of FTC Next, www.ftchinese.com and m.ftchinese.com will display the same thing as next.ftchinese.com. 


### CMS and Development Environment
1. We need to change the way stream pages, especially home page, are created. The editors should **NOT** be concerned with design or layout. They just manage stories and lists. Programs do the rest. 
2. Stories should be upgraded in several ways. First, it should have a way to link to the English version by Unique ID. The way we treat images and media in the story should be streamlined. For example, there should be no need to upload several sizes of the same images. 
3. Channel, tag, marketing, events, special reports pages should all be generalized as Stream Page, meaning a page that mainly contains links to content. The stream page should be fully configurable in the CMS. For example, when we need to create a special report called "Lunch", the editors can just do it without any developers or designers. In fact, home page should be just a specific stream page. 
4. Our current cache system is problematic. Cache should be smart. When editors make a change, the change should be immediately on our site and app. When developers push a change on site, the change should also be immediately on. 
5. We should use Git for version control in NEXT. 

### Story Page
Over 40% of our traffic comes from story page. So it's at least as important as the home page. When users share our content on mobile, they share story page. So it's important to design and develop both for mobile and PC. Since the page is mostly static content, we must make sure it loads instantly by strictly following our performance principles. Special attention should be paid when users open the story page in an app, rather than a browser. 

The core content of the story page includes story title, story body, page header, page navigation (without the part that displays only when hovered). Enhanced content includes ads, related content, hovered navigation, footer, inline media (picture, slide show, captions, quotes, recommendations, video, etc...), and sharing. The HTML file should render core content even if all other requests fail and be under 14k. 

It is possible to display landscape or portrait (for example, Lunch with the FT) main image for the story page. All devices should consider this possibility. 

The story page is mostly likely to be opened in an app's webview. So it's important to test how it renders in-app, for example, in WeChat.  


### Stream Pages
Stream pages are pages that aggregate content. Home page should be just one case of stream page. Although it may look different in the CMS menu, the Stream Page Management feature should be developed just once. 


#### Home Page
We need to design both the home page and the editorial tools for updating the home page. The home page should be designed to be responsive. Editors should be able to focus on the content itself, rather than tinkering with the layout and style. It should also load instantly even on slow connection. It also need to be able to deliver more ad inventories without being noisy and cluttered. 

It is important to seperate content with style. Content should be considered data, which comes in the form of an object (json or PHP array). Style is controled by front end templates. 

Requirements from Feng: Desktop and Mobile app should have different story lists on home page. 

Designer: focus on designing the fluid layout so that editors don't have to preview to be sure the page is good. 

Back end Developer: focus on the CMS interface where editor 1) management lists (blocks) by creating, moving and deleting; 2) management content items (stories, vidoes, interactives, photo slides and manually created items like image, links, etc...) in the page; 3) enable lists and content items to be easily dragged and dropped; 4) create and update the final data object (JSON and PHP Object). 

Front end Developer: Front end developer should not write any logic. He just focuses on performance, display and browser-side features. 

#### Channel
We need to design both the navigation content and the channel pages. Channel pages should have varying layout and content policy, which is configurable in CMS. 
1. Channel pages can be taken off from the navigation, but the url should still be valid with updated content, as search engines have stored these pages. 
2. Channel pages should continue to be paginated. 

#### Tag, Topic and Special Report
Tag and Special Report pages should be configurable in the CMS so that we can instantly create new pages to bring in traffic and revenue. 
1. All the pages should be managed in CMS. 
2. An email page can be created for every web page, using the same content data. 

#### Column
Although traffic to these pages are quite low, columnists are very important to our site. The invidual columnist page is already configurable in CMS. We need to come up with a better design and better features. For example, some columnists might want to maintain their own column pages by syncing their social networks. However, the collection of all columnists page needs a totally new design. 

#### Marketing
Pages that are controled by marketing team, including the FT Intelligence. We use a hack which combined PHP with Smarty to create so call "universal template". This should be upgraded to stream page. 

#### Events

#### Information
contacts, advertisements, and other links in the footer. 


### Advertising
Ad units should be simple and backward compatible. I suggest that we should have two types of basic ad units: MPU and Banner. Then clients can pay extra money for enhanced display, like full page and expandable. The advertisement should be responsive, adapting to any environment. In order to show the clients how HTML 5 works, we should use our own house ad to showcase what's possible. We will also implement stricter security requirements to advertisements. 

1. If a user pays to disable ad, all ads should be hidden. So we need to come up with a way to switch off ads on all platforms. 
2. On the Dolphin system, if the client provide third party code, we need to control how and when to send third party impression track. And we'll monitor call back using GA, FA and our own trackign system. If we let client make the decision, the gap between Dolphin and client impression data will be huge. 
3. The current way of organizing ad channels on Dolphin is stupid. It'll spiral into a disaster some day. We need to come up with a better way. 

### iOS and Android App
The iOS and Android app need to change into Next style, probably by removing the bottom bar and adding a fixed header bar. The home page layout will use data created in the upgraded CMS, rather than from the current API. Other than that, iOS and Android will be developed, upgraded and distributed seperately from the Next project. 


### APIs


### Users
1. Members and subscribers: 
2. Individual Payment and Billing: 
3. Corporate Subscription: 
4. No-Ad Feature: A user can pay to access FTC free of ads. 



### Registration Page

### Video

### Interactive

### Search

### Photo Slides

### User Profile

### 404 Page
Use Andrew Bett's new 404 page, which is both fun and useful. 

### User Comments

### Job Site

### Find Password

### MyFT
The user should be able to follow topics, tags, authors, columns, etc... They are already able to save an article. We also need to have a feature of "articles that I read". Users should be able to receive notification for topics that they followed, both on their mobile phones and chrome. 

### Subscription
Allow users or organizations to pay for: 
1. Access premium content for a certain period. 
2. Access unlimited number of articles for a certain period. 
3. Unlock features. For example, a user can pay 100RMB to hide all ads for a month. 
4. Buy items. For example, a user can buy a special report and read on his phone and Kindle. 
