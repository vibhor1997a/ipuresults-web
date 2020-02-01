<!--
 =========================================================
 * Material Kit - v2.0.6
 =========================================================

 * Product Page: https://www.creative-tim.com/product/material-kit
 * Copyright 2019 Creative Tim (http://www.creative-tim.com)
   Licensed under MIT (https://github.com/creativetimofficial/material-kit/blob/master/LICENSE.md)


 =========================================================

 * The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software. -->


<!DOCTYPE html>
<html lang="en">

<head>
    <!-- Required meta tags -->
    <meta charset="utf-8">
    <meta content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=0" name="viewport" />
    <meta http-equiv="X-UA-Compatible" content="IE=edge,chrome=1" />
    <meta name="description" content="The simplest way to check out your ipu university results. We have results of all programmes be it btech, bba, bca, mba, etc. So, check yours today at ipuresults">
    <meta name="keywords" content="ggsipu,ipuresults,ipuresults.xyz,www.ipuresults.xyz,ip results, ip university results,ipu btech results,ipu bba results,ggsipu results,ipu results,ipuresult,ipu result,ipu bba results, ipu bca results,ipu result app,result app,ip university result app,check ip university rank">
    <meta name="author" content="Vibhor Agrawal">
    <meta name="distribution" content="India" />
    <title>
        <?php
        $title = ucfirst($_GET['rankType']) . " Ranks";
        echo ($title);
        ?>
    </title>
    <!-- Fonts and icons -->
    <link rel="stylesheet" type="text/css" href="https://fonts.googleapis.com/css?family=Roboto:300,400,500,700|Roboto+Slab:400,700|Material+Icons" />
    <!-- Material Kit CSS -->
    <link href="/theme/assets/css/material-kit.css?v=2.0.6" rel="stylesheet" />
    <link rel="stylesheet" href="/assets/css/style.css">
    <link rel="shortcut icon" href="/favicon.ico" type="image/x-icon">
    <?php include 'g-analytics.php' ?>
</head>

<body>
    <?php include 'header.php' ?>
    <div class="main" style="min-height: 85vh">
        <div class="container">
            <div class="section mt-5">
                <div id="ranks-container">
                    <table style="font-size: 0.8em" class="table border table-responsive-sm" id="ranks-table">
                        <thead>
                            <tr>
                                <th>Rank</th>
                                <th>Roll Number</th>
                                <th>Name</th>
                                <th>College</th>
                                <th>Total Marks</th>
                            </tr>
                        </thead>
                        <tbody></tbody>
                    </table>
                    <ul class="pagination pagination-primary">
                        <li class="page-item">
                            <a class="page-link" id="prev-page">
                                PREV
                            </a>
                        </li>
                        <li class="page-item">
                            <a class="page-link" id="next-page">
                                NEXT
                            </a>
                        </li>
                    </ul>
                </div>
                <div id="ads-container"></div>
            </div>
        </div>
    </div>
    <?php include 'footer.php' ?>
    <script src="/assets/js/lib/jquery-3.3.1.min.js"></script>
    <script src="/assets/js/lib/popper.min.js"></script>
    <script src="/theme/assets/js/core/bootstrap-material-design.min.js"></script>
    <script src="/theme/assets/js/material-kit.min.js"></script>
    <script src="/assets/js/config.js"></script>
    <script src="/assets/js/ranks.js"></script>
</body>

</html>