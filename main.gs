//using chome v8. if not need v8 -> change "let" to "var"

function getJdbcReadConnPrms(){
  return {
    bdurl:  'host',
    port:    3306,
    bdname: 'bdname',
    usname: 'usname',
    pass:   'password',
  }
}

function getJdbcReadConnections(){
  var jdbcprm = getJdbcReadConnPrms();
  return Jdbc.getConnection('jdbc:mysql://'+jdbcprm.bdurl+':'+jdbcprm.port+'/'+jdbcprm.bdname, jdbcprm.usname, jdbcprm.pass); 
}

function getQueryPrms(){
  return {
    qname: 'test',
    query:  "SELECT * FROM bdName.tableName;",
    limit:  0,
    numArr: [3] //convert to Number, set column position example [2,5,6] or [2,3,4,5,6]
  }
}

function readFromMysql(){
  var conn  = getJdbcReadConnections(); //this need if run more one executes
  
  var qprms = getQueryPrms();
  var stmt  = conn.createStatement ();
  var jdbc  = getDataFromJdbc(stmt, qprms);
  
  stmt.close ();                       //close after run more one executes
  return jdbc;                         //returned object
} 

function testRead(){
  console.log( readFromMysql() );
}

function getDataFromJdbc(stmt, qprms) {
  let log = 'getDataFromJdbc';
  let query  = qprms.query; 
  let limit  = qprms.limit;
  let numArr = qprms.numArr;
  
  var data = [];
  
  try{
    if( limit>0 )  stmt.setMaxRows(limit);
    var results  = stmt.executeQuery(query);
    var metaData = results.getMetaData();
    var numCols  = results.getMetaData().getColumnCount();
    var arr = [];
    
    //add headers
    for (var col = 0; col < numCols; col++) {
      arr.push(metaData.getColumnName(col + 1));
    }  
    data.push(arr);
    while (results.next()) {    
      var data_row = [];
      for (var col = 0; col < numCols; col ++) {
        let item = results.getString (col +1 );
        data_row.push(item);
      }

      //convert to number for write to spreadsheet, off if not need
      if(numArr.length>0){
        for(var i = 0; i < numArr.length; i++ ){
          data_row[numArr[i]] = Number(data_row[numArr[i]]);
        }
      }
      data.push(data_row);
    }
    results.close ();
  }
  catch(e){
    log += 'error: '+e;
  }
  
  return {
    log:  log,
    resp: data
  }
}
