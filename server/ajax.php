<?php

require '../vendor/autoload.php';

$smarty = new Smarty;
$smarty->left_delimiter = "<%";
$smarty->right_delimiter = "%>";

$smarty->setCaching(Smarty::CACHING_OFF);

$smarty->setTemplateDir(['../views', '../app/templates']);

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

$smarty->assign('topnav', 'china');
$smarty->assign('subnav', 'chinabusiness');

$smarty->display('../app/ajax.tpl');