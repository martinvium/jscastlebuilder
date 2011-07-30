<?php
$app = new BaseApplicationFactory(__DIR__ . '/../config/application.ini');

$router = new RegexRouter();
$router->addControllerFactory($app);
$router->addRoute('/:controller/:action/*');
$router->addRoute('/orders/:action/*', 'getUsersController');
$route = $route->findRoute($app->getRequest());

$controller = $route->getController();
$controller->run($route->getActionName(), $app->getRequest());
