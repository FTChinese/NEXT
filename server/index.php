<?php

require '../vendor/autoload.php';

$smarty = new Smarty;
$smarty->left_delimiter = "<%";
$smarty->right_delimiter = "%>";

$smarty->setCaching(Smarty::CACHING_OFF);

$smarty->setTemplateDir(['../views/emulator', '../app/templates']);

require 'nav-data.php';

$data = [
	"odatalist"=>[
		$home, 
		$china, 
		$global, 
		$economy, 
		$markets, 
		$companies, 
		$opinion, 
		$management, 
		$lifestyle, 
		$stream
	]
];

$smarty->assign('datass1', $data);

$smarty->assign('topnav', 'home');
// $smarty->assign('subnav', 'special');

// $smarty->assign('topnav', 'china');
// $smarty->assign('subnav', 'chinabusiness');

$smarty->display('../views/index.tpl');