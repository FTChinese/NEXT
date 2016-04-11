<?php
/* Smarty version 3.1.29, created on 2016-04-11 07:03:47
  from "/Users/niweiguo/ftrepo/NEXT/views/frontpage/o-header.tpl" */

if ($_smarty_tpl->smarty->ext->_validateCompiled->decodeProperties($_smarty_tpl, array (
  'has_nocache_code' => false,
  'version' => '3.1.29',
  'unifunc' => 'content_570b4c53aef190_18434404',
  'file_dependency' => 
  array (
    'a21acdf82abb80ac38ea1a9e26cf4b1560f2aedd' => 
    array (
      0 => '/Users/niweiguo/ftrepo/NEXT/views/frontpage/o-header.tpl',
      1 => 1460355912,
      2 => 'file',
    ),
  ),
  'includes' => 
  array (
  ),
),false)) {
function content_570b4c53aef190_18434404 ($_smarty_tpl) {
?>
<header class="o-header" data-o-component="o-header">
  <div class="o-header__primary">
    <div class="o-header__container">

      <div class="o-header__top">

        <div class="o-header__edition">
          <button class="switch-button">简体中文版</button>
          <ul class="editions">
            <li><a href="" class="edition-link">繁体中文版</a>
            </li>
            <li><a href="" class="edition-link">英文版</a>
            </li>
          </ul>
        </div>

        <div class="o-header__masthead">
          <a href="/" title="前往FT中文网首页"><span>FT中文网</span></a>
        </div> 

        <nav class="o-header__tools" role="navigation">
          <ul class="tools-items">
              <li class="tools-item">
                <a class="tools-link" href="">myFT</a>
              </li>
              <li class="tools-item">
                <a class="tools-link" href="">退出</a>
              </li>
              <li class="tools-item">
                <a class="tools-link" href="">账户设置</a>
              </li>
          </ul>
        </nav>
      </div><!--  o-header__top --> 
    </div><!--  o-header__container -->     
  </div><!--  o-header__primary  -->

  <div class="o-header__secondary">
    <div class="o-header__container">
      <div class="o-header__bottom">

        <form action="/search" id="search-form" class="o-header__search-form" role="search">
          <button class="search-button" tabindex="1"><span>搜索</span></button> 
          <input id="search-term" type="search" name="q" class="search-input" autocomplete="off" autocorrect="off" spellcheck="false" placeholder="搜索FT中文网" />
        </form>

        <div class="o-header__masthead-mobile">
            <a href="/" title="前往FT中文网首页"><span>FT中文网</span></a>
        </div>

        <nav class="o-header__nav-container" role="navigation">
          
          <button class="nav-toggle" data-o-header-togglable data-o-header-togglable-nav><span>Menu</span></button>

          <ol class="o-header__nav level-1">

            <li class="nav-section mobile">
              <button class="nav-section-head mobile" data-o-header-selectable aria-selected="true">切换版本</button>
                                        
              <ol class="nav-items">
                <li class="nav-item">
                  <a class="nav-link" href="">繁体中文版</a>
                </li>
                <li class="nav-item">
                  <a class="nav-link" href="">英文版</a>
                </li>
              </ol>
            </li>

            
            <?php
$_from = $_smarty_tpl->tpl_vars['datass1']->value['odatalist'];
if (!is_array($_from) && !is_object($_from)) {
settype($_from, 'array');
}
$__foreach_level_1_0_saved_item = isset($_smarty_tpl->tpl_vars['level_1']) ? $_smarty_tpl->tpl_vars['level_1'] : false;
$_smarty_tpl->tpl_vars['level_1'] = new Smarty_Variable();
$_smarty_tpl->tpl_vars['level_1']->_loop = false;
foreach ($_from as $_smarty_tpl->tpl_vars['level_1']->value) {
$_smarty_tpl->tpl_vars['level_1']->_loop = true;
$__foreach_level_1_0_saved_local_item = $_smarty_tpl->tpl_vars['level_1'];
?>
            <li class="nav-section"
            <?php if ($_smarty_tpl->tpl_vars['topnav']->value == $_smarty_tpl->tpl_vars['level_1']->value['code']) {?>
            aria-selected="true"
            <?php }?>
            data-section="<?php echo $_smarty_tpl->tpl_vars['level_1']->value['code'];?>
">

              <button class="nav-section-head mobile" data-o-header-selectable><?php echo $_smarty_tpl->tpl_vars['level_1']->value['name'];?>
</button>

              <a class="nav-section-head desktop" href="<?php echo $_smarty_tpl->tpl_vars['level_1']->value['link'];?>
"><?php echo $_smarty_tpl->tpl_vars['level_1']->value['name'];?>
</a>

              <ol class="nav-items level-2">

                <li class="nav-item mobile">
                  <a class="nav-link" href="<?php echo $_smarty_tpl->tpl_vars['level_1']->value['link'];?>
">
                  <?php if ($_smarty_tpl->tpl_vars['level_1']->value['code'] == 'home') {?>FT中文网首页
                  <?php } else { ?>
                  频道首页
                  <?php }?></a>
                </li>


                <?php
$_from = $_smarty_tpl->tpl_vars['level_1']->value['children'];
if (!is_array($_from) && !is_object($_from)) {
settype($_from, 'array');
}
$__foreach_level_2_1_saved_item = isset($_smarty_tpl->tpl_vars['level_2']) ? $_smarty_tpl->tpl_vars['level_2'] : false;
$_smarty_tpl->tpl_vars['level_2'] = new Smarty_Variable();
$_smarty_tpl->tpl_vars['level_2']->_loop = false;
foreach ($_from as $_smarty_tpl->tpl_vars['level_2']->value) {
$_smarty_tpl->tpl_vars['level_2']->_loop = true;
$__foreach_level_2_1_saved_local_item = $_smarty_tpl->tpl_vars['level_2'];
?>
                
                <li class="nav-item"
                <?php if ($_smarty_tpl->tpl_vars['subnav']->value == $_smarty_tpl->tpl_vars['level_2']->value['code']) {?>
                aria-selected="true"
                <?php }?>
                <?php if (($_smarty_tpl->tpl_vars['level_2']->value['haschildren'])) {?>
                aria-haspopup="true"
                <?php }?>
                data-channel="<?php echo $_smarty_tpl->tpl_vars['level_2']->value['code'];?>
">
                  <a class="nav-link" href="<?php echo $_smarty_tpl->tpl_vars['level_2']->value['link'];?>
"><?php echo $_smarty_tpl->tpl_vars['level_2']->value['name'];?>
</a>
                  
                  <?php if (($_smarty_tpl->tpl_vars['level_2']->value['haschildren'])) {?>
                  <ol class="nav-sub-items level-3">
                  
                    <?php
$_from = $_smarty_tpl->tpl_vars['level_2']->value['children'];
if (!is_array($_from) && !is_object($_from)) {
settype($_from, 'array');
}
$__foreach_level_3_2_saved_item = isset($_smarty_tpl->tpl_vars['level_3']) ? $_smarty_tpl->tpl_vars['level_3'] : false;
$_smarty_tpl->tpl_vars['level_3'] = new Smarty_Variable();
$_smarty_tpl->tpl_vars['level_3']->_loop = false;
foreach ($_from as $_smarty_tpl->tpl_vars['level_3']->value) {
$_smarty_tpl->tpl_vars['level_3']->_loop = true;
$__foreach_level_3_2_saved_local_item = $_smarty_tpl->tpl_vars['level_3'];
?>
                    <li><a href="<?php echo $_smarty_tpl->tpl_vars['level_3']->value['link'];?>
"><?php echo $_smarty_tpl->tpl_vars['level_3']->value['name'];?>
</a></li>
                    <?php
$_smarty_tpl->tpl_vars['level_3'] = $__foreach_level_3_2_saved_local_item;
}
if ($__foreach_level_3_2_saved_item) {
$_smarty_tpl->tpl_vars['level_3'] = $__foreach_level_3_2_saved_item;
}
?>

                  </ol>
                  <?php }?>

                </li>
                <?php
$_smarty_tpl->tpl_vars['level_2'] = $__foreach_level_2_1_saved_local_item;
}
if ($__foreach_level_2_1_saved_item) {
$_smarty_tpl->tpl_vars['level_2'] = $__foreach_level_2_1_saved_item;
}
?>
              </ol>

            </li>
            <?php
$_smarty_tpl->tpl_vars['level_1'] = $__foreach_level_1_0_saved_local_item;
}
if ($__foreach_level_1_0_saved_item) {
$_smarty_tpl->tpl_vars['level_1'] = $__foreach_level_1_0_saved_item;
}
?>

            <li class="nav-item mobile">
              <a class="nav-link" href="">myFT</a>
            </li>
            <li class="nav-item mobile">
              <a class="nav-link" href="">退出</a>
            </li>
            <li class="nav-item mobile">
              <a class="nav-link" href="">账户设置</a>
            </li>
          </ol>
        </nav>

        <ul class="o-header__extra-tools nav-items">
          <li class="nav-item" aria-haspopup="true">
            
            <a class="nav-link" href="http://www.ftchinese.com/m/corp/follow.html">关注我们</a>

            <ol class="nav-sub-items follow-us">
              <li><a href="" class="follow-sina-weibo">新浪微博</a></li>
              <li><a href="" class="follow-tencent-weibo">腾讯微博</a></li>
              <li><a href="" class="follow-netease-weibo">网易微博</a></li>
              <li><a href="" class="follow-sohu-weibo">搜狐微博</a></li>
              <li><a href="" class="follow-qzone">QQ空间</a></li>
              <li><a href="" class="follow-sina-blog">新浪博客</a></li>
              <li><a href="" class="follow-sohu-blog">搜狐博客</a></li>
              <li><a href="" class="follow-netease-lofter">网易博客</a></li>
              <li><a href="" class="follow-renren">人人网</a></li>
              <li><a href="" class="follow-facebook">FaceBook</a></li>
              <li><a href="" class="follow-twitter">Twitter</a></li>
              <li><a href="" class="follow-google-plus">Google+</a></li>
            </ol>
          </li>
          <li class="nav-item" aria-haspopup="true">
            <span class="nav-link">工具</span>
            <ol class="nav-sub-items">
              <li><a href="">移动应用大全</a></li>
              <li><a href="">基本设置</a></li>
              <li><a href="">修改头像</a></li>
              <li><a href="">邮件订阅</a></li>
              <li><a href="">同步微博</a></li>
              <li><a href="">我的评论</a></li>
              <li><a href="">管理收藏</a></li>
            </ol>
          </li>
          <li class="nav-item">
            <a class="nav-link follow__rss" href="http://www.ftchinese.com/channel/rss.html"><span>RSS</span></a>
          </li>
        </ul>
      </div><!-- * o-header__bottom -->
    </div><!-- o-header__container -->    
  </div><!-- o-header-secondary -->

</header><?php }
}
