<?php
namespace Delphinium\Toolbox\Models;

use Model;

/**
 * apitool Model
 */
class Apitool extends Model
{

    /**
     * @var string The database table used by the model.
     */
    public $table = 'delphinium_toolbox_apitools';

    /**
     * @var array Guarded fields
     */
    protected $guarded = ['*'];

    /**
     * @var array Fillable fields
     */
    protected $fillable = ['name','animate','size','custom_css'];

    /**
     * @var array Relations
     */
    public $hasOne = [];
    public $hasMany = [];
    public $belongsTo = [];
    public $belongsToMany = [];
    public $morphTo = [];
    public $morphOne = [];
    public $morphMany = [];
    public $attachOne = [];
    public $attachMany = [];

}