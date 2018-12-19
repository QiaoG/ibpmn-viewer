import $ from 'jquery';


// require the viewer, make sure you added it to your project
// dependencies via npm install --save-dev bpmn-js
import BpmnViewer from 'bpmn-js/lib/NavigatedViewer';

import BpmnModeler from 'bpmn-js/lib/Modeler';

import EmbeddedComments from 'bpmn-js-embedded-comments';

var viewer = new BpmnModeler({
  container: '#canvas',
  additionalModules: []
});

// function formatXML(xml) {
//   var fil = [/<bpmn2:extensionElements>\n?/m,/<\/bpmn2:extensionElements>\n?/m,/<activiti:taskListener\s+event="create"\s+class="com\.iwork\.process\.management\.listener\.RuntimeAssigneeListener"\/>\n?/m];
//   for(var i = 0; i < fil.length; i++){
//     xml = xml.replace(fil[i],'');
//   }
//   return xml;
// }

var elementRegistry = viewer.get('elementRegistry');
var modeling = viewer.get('modeling');

//适配老设计器生成的bpmn文件（xml）
function adaptBpmn() {
  console.info("适配老版本xml");
  var eles = elementRegistry.filter(function (element, gfx) {
    return element.type === "bpmn:SequenceFlow";
  });
  console.info(eles);
  var s, t, p;
  for(var i = 0; i < eles.length; i++){
    s = eles[i].source;
    t = eles[i].target;
    p = eles[i].parent;
    modeling.removeElements([eles[i]]);
    modeling.connect(s,t,undefined,p);
  }
}


function openDiagram(diagram) {

  // var elementRegistry = viewer.get('elementRegistry'),
  //   modeling = viewer.get('modeling');

  viewer.importXML(diagram, function(err) {
    if (err) {
      alert('could not import BPMN 2.0 XML, see console');
      return console.log('could not import BPMN 2.0 XML', err);
    }
    var index = diagram.indexOf('xmlns:bpmn2');
    console.log("xmlns:bpmn2 index="+index);
    if(index < 0) {//老版载入
      adaptBpmn();
    }
    console.log('success!');
    viewer.get('canvas').zoom('fit-viewport');
    var elementToColor = elementRegistry.get('step_be61e1b1-a9a5-1c15-3256-322e28906099');
    if(elementToColor){
      modeling.setColor([ elementToColor ], {
        stroke: 'green',
        fill: 'rgba(0, 80, 0, 0.4)'
      });
    }else{
      console.info('element UserTask_1rie7j9 no exist!');
    }
  });


}


// file save handling

var $download = $('[data-download]');

function serialize() {

  viewer.saveXML(function(err, xml) {

    var encodedData = err ? '' : encodeURIComponent(xml);

    $download.attr({
      'href': encodedData ? 'data:application/bpmn20-xml;charset=UTF-8,' + encodedData : '',
    });

    if (err) {
      console.log('failed to serialize BPMN 2.0 xml', err);
    }
  });
}

viewer.on('comments.updated', serialize);
viewer.on('commandStack.changed', serialize);

viewer.on('canvas.click', function() {
  viewer.get('comments').collapseAll();
});



// we use stringify to inline a simple BPMN diagram
import xml from '../resources/rr.bpmn';//pizza-collaboration-annotated.bpmn';
openDiagram(xml);

