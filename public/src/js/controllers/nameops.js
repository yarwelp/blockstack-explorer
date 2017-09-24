'use strict';

angular.module('insight.nameops').controller('NameopsController',
function($scope, $rootScope, $routeParams, $location, Global, Nameops, Block, BlockByHeight, 
  NodeInfoBlock, NodeInfoConsensus, NodeInfoServer) {
  $scope.global = Global;
  $scope.loading = false;

  var _loadBlock = function(blockHeight) {
    $scope.loading = true;

    $scope.blockHeight = blockHeight;

    BlockByHeight.get({
      blockHeight: $scope.blockHeight
    }, function(hash) {

    Block.get({
      blockHash: hash.blockHash
    }, function(block) {
      $rootScope.titleDetail = block.height;
      $rootScope.flashMessage = null;
      $scope.loading = false;
      $scope.block = block;
    }, function(e) {
      if (e.status === 400) {
        $rootScope.flashMessage = 'Invalid Transaction ID: ' + $routeParams.txId;
      }
      else if (e.status === 503) {
        $rootScope.flashMessage = 'Backend Error. ' + e.data;
      }
      else {
        $rootScope.flashMessage = 'Block Not Found';
      }
      $location.path('/');
    });
    }, function() {
      $rootScope.flashMessage = 'Bad Request';
      $location.path('/');
    });

    Nameops.get({
      blockHeight: blockHeight
    }, function(response) {
      $scope.loading = false;
      $scope.nameops = response.nameops;
      $scope.stats = response.stats;
    }, function(e) {
      console.log(e);

      $rootScope.flashMessage = 'Backend Error';

      $location.path('/');
    });

    NodeInfoBlock.get({}, function(response) {

      var nodeInfo = Object.assign({}, response)

      NodeInfoConsensus.get({}, function(response) {
        nodeInfo.consensus = response.consensus_hash
      }, function(e) {
        console.log(e)
      });

      NodeInfoServer.get({}, function(response) {
        nodeInfo.server_version = response.version
      }, function(e) {
        console.log(e)
      });
      
      $scope.nodeInfo = nodeInfo;
    }, function(e) {
      console.log(e);

      $rootScope.flashMessage = 'Backend Error';

      $location.path('/');
    });

  };

  $scope.findThis = function() {
    _loadBlock($routeParams.blockHeight);
  };

  $scope.loadBlock = function(blockHeight) {
    $scope.loadingNameops = true;
    $scope.unprocessedBlock = false;
    NodeInfoBlock.get({}, function(response) {

      var nodeInfo = Object.assign({}, response)

      NodeInfoConsensus.get({}, function(response) {
        nodeInfo.consensus = response.consensus_hash
      }, function(e) {
        console.log(e)
      });

      NodeInfoServer.get({}, function(response) {
        nodeInfo.server_version = response.version
      }, function(e) {
        console.log(e)
      });

      $scope.nodeInfo = nodeInfo;

      if(blockHeight <= response.last_block_processed) {
        $scope.unprocessedBlock = false;
        Nameops.get({
          blockHeight: blockHeight
        }, function(response) {
          $scope.nameops = response.nameops;

        }, function(e) {
          console.log(e);

          $rootScope.flashMessage = 'Error loading name operations in block #' + blockHeight;

        });
      } else {
        $scope.unprocessedBlock = true;
      }
      $scope.loadingNameops = false;

    }, function(e) {
      console.log(e);

      $rootScope.flashMessage = 'Error loading Blockstack node info';

    });

  };

});
