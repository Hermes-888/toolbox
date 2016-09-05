<?php namespace Delphinium\Toolbox;

use System\Classes\PluginBase;
use Backend;
use Event;

class Plugin extends PluginBase
{
    public $require = [
        'Delphinium.Roots'
    ];
    /**
     * Returns information about this plugin.
     *
     * @return array
     */
    public function pluginDetails()
    {
        return [
            'name'        => 'Toolbox',
            'description' => 'API testing',
            'author'      => 'Delphinium',
            'icon'        => 'icon-wrench'
        ];
    }

    public function registerComponents()
    {
        return [
            '\Delphinium\Toolbox\Components\Apitool' => 'apitool'
        ];
    }

    public function boot()
    {
        Event::listen('backend.menu.extendItems', function($manager) {
            $manager->addSideMenuItems('Delphinium.Roots', 'delphinium', [
                'Apitool' => array(
                    'label' => 'Apitool',
                    'icon' => 'icon-wrench',
                    'owner' => 'Delphinium.Roots',
                    'url' => Backend::url('delphinium/toolbox/apitool'),
                    'group' => 'Toolbox')
            ]);
        });
    }
}
