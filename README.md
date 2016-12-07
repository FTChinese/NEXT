# FTChinese Next Project

## gulp tasks
- `gulp origami`: Fetch o-gallery
- `gulp home`: Fetch latest homepage contents and update `app/index.html`.
- `gulp story`: Fetch json data from story api. Might fail due to PHPSESSIN restrict.
- `gulp nav`: Fetch `nav.json`
- `gulp styles`: Compile scss with `gulp-sass`
- `gulp jshint`
- `gulp html`: Concatenate js and css with `gulp-useref`
- `gulp serve`: Launch a static server. Index page default to `app/index.html`
- `gulp build`: `jshint`, `html`, `images` and `ad` task in one shot.
- `gulp copy`: `clean`, `build` and then copy assets.

## 用户体验改版要点
### 设计
全新的[首页](http://next.ftchinese.com/)、[频道页](http://next.ftchinese.com/channel/china.html)和[文章页](http://next.ftchinese.com/story/001067390)设计，令读者可以更加方便地浏览内容和阅读文章。新的页面不但支持电脑，还支持移动设备，令您可以随时随地阅读FT中文网的精彩内容。

### 页面性能
使用最新的优化技术，令大多数页面可以在1秒钟之内呈现。只加载刚好适合您的设备的图片，为您节省带宽流量。

### 我的FT
新推出我的FT，为您量身打造只属于您自己的英国《金融时报》。您可以设置关注特定的话题，只看自己想看的内容；基于大数据的内容推荐系统会为你带来惊喜，帮你发现你可能会忽略的好文章；也可以收藏好文章，便于将来重温。

### [英语学习](http://next.ftchinese.com/index.php/ft/channel/english.html)
我们将广受读者喜爱的英语学习频道提升为主频道，在原有的双语阅读和金融英语速读的基础上增加了原声视频和FT英文电台。您现在不但可以用FT来提升自己的英文阅读能力，还可以提高自己的英语听力。

### [FT商学院](http://next.ftchinese.com/index.php/ft/channel/mba.html)
FT商学院在原有的新闻小测、热点观察和全球商学院排行的基础上，增加了MBA训练营，帮助您利用碎片时间学习金融、管理和商业中的重要概念。

### [创业频道](http://next.ftchinese.com/index.php/ft/channel/startup.html)
我们为科技创业者推出了全新的创业频道。这个频道专注于创业、创新和投资，致力于将全球最新的科技潮流和创业实践带给中国的创业者、创新者和投资者。

### [中国经济晴雨表](https://ig.ft.com/sites/numbers/economies/china)
一张图胜过千言万语，定期更新的中国经济晴雨表把中国经济的所有关键数据放在一起，助您及时把握经济的转折点。


## 广告和商业要点
### 广告支持HTML 5
随着Flash逐渐退出市场，HTML 5成为广告的新标准。FT中文网全面支持HTML 5技术，令广告客户可以投放制作精良、动画流畅、效果上佳的HTML 5广告。

### High Impact广告
广告位更加大气醒目，支持滑动、扩展等更多的特效。



## User Experience Updates
### Design
New [home](http://next.ftchinese.com/)、[channel](http://next.ftchinese.com/channel/china.html) and [story](http://next.ftchinese.com/story/001067390) pages makes it much easier to browse and read. The new responsive design supports both desktop and mobile devices. You can enjoy FTChinese' high-quality content any time, any where. 

### Performance
Using cutting-edge optimization technology, most pages can render in just one second. You only need to load the images that just enough for your device, saving bandwidth. 

### MyFT
The new MyFT section is a Financial Times only for you. You follow topics of your interest and read only what you want; our big data recommendation is a source of serendipity, helping you find good articles that you might have missed; you can also save your articles for future rereading. 

### [English Learning](http://next.ftchinese.com/index.php/ft/channel/english.html)
English learning, a favorite among our users, is promoted to be a main channel. In addition to bilingual stories and speed-read, we now have videos and audios. You can now use FT to improve your reading and listening skills.  


### [FT Academy](http://next.ftchinese.com/index.php/ft/channel/mba.html)
We have a new MBA GYM section in our FT Academy channel, alongside our News Quiz, Explainer and Global MBA Ranking. You can use your spare time to learn important concepts in finance, management and business. 

### [New Startup Channel](http://next.ftchinese.com/index.php/ft/channel/startup.html)
The new startup channel focus on technology entrepreneurship, innovation and investment. We aim to bring the latest technology trends and best practice to Chinese entrepreneurs, innovators and investors. 


### [China Economy Dashboard](https://ig.ft.com/sites/numbers/economies/china)
A picture is worth a thousand words. We present all the important Chinese economic data in one page and update constantly, helping you keep ahead of the turning point. 


## Advertising and Commercial Updates
### Embracing HTML 5
As Flash fades out of the market, HTML 5 is the new standard for online advertising. FTChinese supports HTML 5 fully, making it easy for clients to deliver slick advertising with smooth animation and great effectiveness. 

### High Impact Advertising
In our new version, advertising unit can be enhanced to high impact, which is bigger in size and supports advanced features like sticky and expanding. 



# Detailed Information about the Project


## Goals
### Design
Redesign the www.ftchinese.com for best content display on all devices. 

### Performance
Upgrade the performance of the web site, especially mission-critical pages, to the highest standard. 

### Efficiency
Streamline editorial workflow so that our editors can update content and page as fast as possible. All pages, not just home, should be managed in CMS without any tech knowledge. 

### Advertising
Embrace HTML 5 in our advertisements to delivery high-quality ad display and maximize ad performance. 

### Monetization
Kickstart our own growth and monetizing efforts, especially subscription business. 


## Previews
On www.ftchinese.com, if you add ?n=1 at the end of the url, the page will be displayed in Next style. For example: 
* [Home Page](http://www.ftchinese.com/?n=1)
* [China](http://www.ftchinese.com/channel/china.html?n=1)
* [Lunch with the FT](http://www.ftchinese.com/tag/与FT共进午餐?n=1)
* [Story Page](http://www.ftchinese.com/story/001066965?n=1)


## Milestones

| Date             | Event                                                    |
|------------------|----------------------------------------------------------|
| Dec 15, 2015     | Infractures and development environment (Done)           |
| Feb 01, 2016     | Story page complete (Done)                               |
| Mar 01, 2016     | Home page and stream pages complete (Done)               |
| Apr 15, 2016     | All relavant pages on current site has a Next version    |
| June 10th, 2016  | MyFT                                                     |
| **June 15, 2016**| **Launch**                                               |
| Jul 01, 2016     | Server-side converted to NodeJS                          |
| **Dec 01, 2016** | **Corporate subscription complete**                      |

## Roles

### Designers
* Visual Design: Layout, Color, Icon, Font, Styles, Components
* UI Design: Function, User Interaction, Login, Register, Comments, Sharing

### Developers
The development team will focus on achieving the highest possible performance, both on the front and back end. Special focus should be on two mission-critical pages: story and stream. Home page is a stream page. 

When we launch the Next FTC, our front end code will be a total revamp. The server side will continue to use PHP, mysql and smarty until we can have a London developer to help us convert to NodeJS. After converting to NodeJS, we'll be able to use server side code developed by the London team, which makes it possible for the FTChinese to launch new features in sync with London. 

#### PHP Developers
* API 
* Data
* Logic
* Security
* Performance

#### Frontend Developers
* HTML, CSS and JavaScipt
* Components

#### Java Developer
Focus on android app, database and video. 

### Network Engineers
* Set up and maintain server
* Development and Deploy environment
* Switch the site to Next on the launch day
* Monitor performance
* Testing
* Handle traffic and database related issues

## **Support**
The FTChinese current team will be able to launch the new Next site on its own, using existing technology. However, in order to upgrade beyond the launch, we need these developers from London to help us with the following tasks: 

* Switch to NodeJS on the server side, so that our site can support more active users per day, with the same resources. 
* Develop MyFT and Subscription. 
* Streamline our development tools and workflows. 
* Integrate with London's developement team, code base and APIs. 
* Train our developers. 

As the FT London will finish the Next FT in summer of 2016, their technology and experience will be suitable for the FTChinese when we upgrade our server side technology. Since we have very high standard both in terms of performance and code quality, outsourcing is not an option. 

## Cost
* New Servers: we will be needing 10 new servers for the new site, replacing our current servers. 
* Software License: we need to pay software license to tools that we'll using in the design and development of the Next FTC, including Github Private Account (Coordination), Sublime (Developer), Get Sentry (Bug Capturing), Testing Services, Schetch (Designer), Invision (Designer), etc...
* Bandwidth: we'll be needing 5M more bandwidth for the new site. 
* Developers: wages and accomodation for developers from FT London. 

## Performance
The home page, story page and channel page contributes more than 90% of the site traffic. These pages will be developed from scratch and their performance will be evaluated every week by the following list. Code should be reviewed at least every month. 

### Performance Checklist

* Get 100 points in Google's [Page Speed Insights](https://developers.google.com/speed/pagespeed/insights/). 
* Core experience, as defined in [General Best Practice](http://origami.ft.com/docs/developer-guide/general-best-practices/) is available in the first request, without any external CSS and JS. 
* First response is smaller than 14k after GZIP. 
* Use serviceworker, when supported, to cache assets and save time. 
* Don't load custom Chinese web font for web page. 
* Ad codes don't block critical content. 
* Load as less as possible CSS and images on mobile (especially data which are paid by traffic) by serving different mobile CSS and full CSS. 
* Use skeleton screens, placeholders, relative divs and Responsive Image Service to load images and avoid reflow. 
* Lazy-load images that are not in the first view. 
* Check if CSS and JS is loaded successfully and fall back when CDN fails. 
* Use Preconnect and Prefetch to speed up asset loading. 
    `<link href="http://static.ftchinese.com/" rel="preconnect" crossorigin>`
* Core static pages (home, story and channel) should render regardless of database condition. 

None of the big web sites that we know of (Google, Baidu, FT, Guardian, etc...) has been able to achieve item 3. It requires us to be very clear of the priority order of every element on the page. But with our server in HK and main audience in mainland China, making sure critical content are rendered even on very unreliable internet connection is worth the extra effort. 

### References
* [Origami Example](http://origami.ft.com/docs/developer-guide/using-modules/)
* [General Best Practice](http://origami.ft.com/docs/developer-guide/general-best-practices/)
* [Under Standing Critical CSS](http://www.smashingmagazine.com/2015/08/understanding-critical-css/)
* [CSS and Critical Path](https://speakerdeck.com/patrickhamann/css-and-the-critical-path)
* [Google Web Fundamentals](https://developers.google.com/web/fundamentals/)
* [Embracing the Network](https://speakerdeck.com/patrickhamann/embracing-the-network-smashing-conf)

## Projects
The projects are prioritized based on importance and dependency. 

### Infrastructure
Server-side set up of next.ftchinese.com, including database, API, cache, template engine(Smarty 3), etc... 

The next.ftchinese.com site will be the equivalent of next.ft.com, allowing stake holders to see what we have built any time. On the launch day of FTC Next, www.ftchinese.com and m.ftchinese.com will display the same thing as next.ftchinese.com. 

We should use Git for version control in NEXT. 

Our current cache system is problematic. Cache should be smart. When editors make a change, the change should be immediately on our site and app. When developers push a change on site, the change should also be immediately on. 

### CMS
Before June, we will focus on three most important upgrades with our CMS. 

#### Home Page
We need to change the way pages, especially home page, are created. The editors should not be burdened with design or layout. They just manage stories and lists. Programs do the rest. 

The list and story system should: 

1. Generate a API, which can be output into JSON, for developer to layout the pages. 
2. Be easy for editor to add, edit, and delete both lists and items (story, video, interactive features, text, url etc...) without any technical knowledge. 
3. Delegate control to the right person/team. For example, the marketing/event block should fall under their control, rather than bothering editorial team. 
4. Leave the robotic work to robots. 

#### Story Edit
Stories should be upgraded in several ways. First, it should have a way to link to the English version by Unique ID. The way we treat images in the story should be streamlined. For example, there should be no need to upload several sizes of the same images. And it should be easy to insert all kinds of inline media, including video, image, caption, aside box, quotes, social codes, subtitle etc...

#### Stream Pages
Channel, tag, marketing, events, special reports pages should all be generalized as Stream Page, meaning a page that mainly contains links to content. The stream page should be fully configurable in the CMS. For example, when we need to create a special report called "Lunch", the editors can just do it without any developers or designers. In fact, home page should be just a specific stream page. 

After June, we'll review our current CMS system as a whole and decide whether to replace it with a new one. 

### Story Page
Over 40% of our traffic comes from story page. So it's at least as important as the home page. When users share our content on mobile, they share story page. So it's important to design and develop both for mobile and PC. Since the page is mostly static content, we must make sure it loads instantly by strictly following our performance principles. Special attention should be paid when users open the story page in an app, rather than a browser. 

The core content of the story page includes story title, story body, page header, page navigation (without the part that displays only when hovered). Enhanced content includes ads, related content, hovered navigation, footer, inline media (picture, slide show, captions, quotes, recommendations, video, etc...), and sharing. The HTML file should render core content even if all other requests fail and be under 14k. 

It is possible to display landscape or portrait (for example, Lunch with the FT) main image for the story page. All devices should consider this possibility. 

The story page is mostly likely to be opened in an app's webview. So it's important to test how it renders in-app, for example, in WeChat.  

Basic Elements: 
* main tag in red
* publish time
* cover image in both landscape and portrait
* inline images: three types
* related stories in the right rail

* share
* comments
* print
* save


Need API Support
* related stories at the bottom, with images


The story should also support these inline media types: 
* Photo Slides
* Images (it would be better to have the width and height data in the image; it should support captions)
* Promotion Box (Related Topics, Reports, Urls, Downloads, etc...)
* Videos
* Charts (either in SVG or JavaScript, but needs to be dynamic)
* Polling
* Quotes
* Social box (icons, links, QR codes, etc...)
* Seamless iFrames (interactive features, etc...)

For stories translated from FT.com, there's an API that provides: 
* FT.com unique ID. 
* Media sets including images, video and links. 
* Meta tags. 

### Stream Pages
Stream pages are pages that aggregate content. Home page is a stream page. The Stream Page Management feature should be developed just once and assigned to seperate teams for operation. 


#### Home Page
We need to design both the home page and the editorial tools for updating the home page. The home page should be designed to be responsive. Editors should be able to focus on the content itself, rather than tinkering with the layout and style. It should load instantly even on slow and unreliable internet connection. It also needs to deliver more ad inventories without being noisy and cluttered. 

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
The events site used a lot of "hacks" when built, under the assumption that this part of the site will not need to be upgraded. It has a seperate design and style sheets, which makes upgrading it more tedious. There are two options for the event site: migrate to Next Stream Page system or stay put. 

#### Information
Contacts, advertisements, and other links in the footer. The information in these pages usually don't change frequently. But it should be delegated to marketing team in the CMS system so that it can change any time. 

<div style="width:100%;height:90px;background-color:#92288f;text-align:center;line-height:90px;font-size:25px;color:white;">
	Reponsive Banner
</div>

### Advertising
#### Regular
Ad units should be simple and backward compatible. I suggest that we should have two types of basic ad units: MPU and Banner. Then clients can pay extra money for enhanced display, like full page and expandable. The advertisement should be responsive, adapting to any environment. In order to show the clients how HTML 5 works, we should use our own house ad to showcase what's possible. We will also implement stricter security requirements to advertisements. 

<div class="mpu" style="width:300px;height:250px;background-color:#cc0033;text-align:center;line-height:250px;font-size:32px;color:white;margin:5px 0 14px 14px;float:right;">
	MPU
</div>
1. If a user pays to disable ad, all ads should be hidden. So we need to come up with a way to switch off ads on all platforms. 
2. On the Dolphin system, if the client provide third party code, we need to control how and when to send third party impression track. And we'll monitor call back using GA, FA and our own trackign system. If we let client make the decision, the gap between Dolphin and client impression data will be huge. 
3. The Dolphin system makes no distinction between ad channel and ad position. This will spiral into an unmanageable mess in two years. We need to discuss this when we develop advertising for Next. 
4. In the new design, we should avoid expanding MPU into halfpage, as it might break the layout and lowers viewability. Instead, the reponsive banners can be expanded vertically if clients want to buy high-impact ads. 
5. All the ad positions should be delivered through friendly iframes or ajax. The "document.write" way should be avoided as it is blocking not only to content, but also other advertisement. In our current web site, if IBM loads its top banner ad assets in one minute, Accenture have to wait for one minute before its MPU unit is rendered. So making ads non-blocking is beneficial to both readers and advertisers. It is also easy to do creative advertisement such as expandable on friendly iframe. 


#### Sponsorship
For sponsored special reports, we should have a block on home page. The block should have title, ad unite banner, headline and lead. This way, we will have enough inventory for each campaign. 


### Partials
Partials are short snippets of HTML templates that are included in pages or other partials. They should all be placed in a new folder called partials. All the partials should switch from using models to APIs. 


### iOS and Android App
The iOS and Android app need to change into Next style, probably by removing the bottom bar and adding a fixed header bar. The home page layout will use data created in the upgraded CMS, rather than from the current API. Other than that, iOS and Android will be developed, upgraded and distributed seperately from the Next project. 

We will also enable iOS to receive both remote notification. Notification will be used along with customization, retention, awakening and segmentation. 

### APIs

### Analytics
1. Pages
2. Events
3. Custom Reports
4. Experiments (A/B Tests)

### Registration Page

### Video

### Interactive

### Search

### Photo Slides

### User Profile

### 404 Page
Use FT.com's new 404 page, which is both fun and useful. 

### User Comments
After discussing with Feng Wang, we decided that user comments should use Sina Weibo API rather than our own. This way we don't have to spend time censoring user comments and users can see their post immediately after submiting. 

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

## FAQ
### How important is it to keep the first request (the HTML file) under 14k? 
- It is to make sure the page renders as soon as the first request is back
- Core CSS and JS should be embeded to make this meaningful
- If the file is over 14k, consider seperate HTML into Critical and Enhanced
- Critical includes anything until the second content block (in our design)
- Enhanced includes content blocks under critical (usually the second screen)
- If we load enhanced content async, search engines won't grab these links. It would affect the weight of the links. 

### Why not use Markdown in the Next project? 
- Need to learn. No editor has heard of it. Editors hate learning new language. 
- May not do all the tricks needed (videos, slide shows, aside, quotes etc...). 
- Rely on third-party interpreter, which means less control from our own developers. 
- Our past stories are in HTML format. 
- Not really open standard like HTML. 
- Editors will rely on visual interface anyway. 

### What are new requirements for subscription business? 
- Accessibility: once users pay for a service, they become very picky in terms of service. For example, if an article is blocked by the government, we need to find a way to deliver it to the end user. 
- Customer Service: when there's a problem, users will need to get a solution immediately. Sometimes this means speaking to a person. 

### How should we manage our user comments? 


## Install gulp 4.0

- Global gulp:

	npm uninstall -g gulp 
	npm install -g "gulpjs/gulp-cli#4.0"

- Local gulp:

	npm uninstall gulp --save-dev 
	npm install "gulpjs/gulp#4.0" --save-dev
