<?php
/**
 * Copyright (C) 2012-2016 Project Delphinium - All Rights Reserved
 *
 * This file is subject to the terms and conditions defined in
 * file 'https://github.com/ProjectDelphinium/delphinium/blob/master/EULA',
 * which is part of this source code package.
 *
 * NOTICE:  All information contained herein is, and remains the property of Project Delphinium. The intellectual and technical concepts contained
 * herein are proprietary to Project Delphinium and may be covered by U.S. and Foreign Patents, patents in process, and are protected by trade secret or copyright law.
 * Dissemination of this information or reproduction of this material is strictly forbidden unless prior written permission is obtained
 * from Project Delphinium.
 *
 * THE RECEIPT OR POSSESSION OF THIS SOURCE CODE AND/OR RELATED INFORMATION DOES NOT CONVEY OR IMPLY ANY RIGHTS
 * TO REPRODUCE, DISCLOSE OR DISTRIBUTE ITS CONTENTS, OR TO MANUFACTURE, USE, OR SELL ANYTHING THAT IT  MAY DESCRIBE, IN WHOLE OR IN PART.
 *
 * Unauthorized copying of this file, via any medium is strictly prohibited
 * Non-commercial use only, you may not charge money for the software
 * You can modify personal copy of source-code but cannot distribute modifications
 * You may not distribute any version of this software, modified or otherwise
 */

namespace Delphinium\Toolbox\Updates;

use Schema;
use October\Rain\Database\Updates\Migration;

class CreateApitoolsTable extends Migration
{

    public function up()
    {
        if ( !Schema::hasTable('delphinium_toolbox_apitools') )
        {
            Schema::create('delphinium_toolbox_apitools', function($table)
            {
                $table->engine = 'InnoDB';
                $table->increments('id');
                $table->string('name');
                $table->boolean('animate');
                $table->integer('size');
                $table->longText('custom_css');
                $table->timestamps();
            });
        }
    }

    public function down()
    {
        Schema::dropIfExists('delphinium_toolbox_apitools');
    }

}
