/**
 * This file should be placed at the node_modules sub-directory of the directory where you're
 * executing it.
 *
 * Written by Fernando Castor in November/2017.
 */
exports.solve = function(fileName) {
    let formula = readFormula(fileName);
    let result = doSolve(formula.clauses, formula.variables);
    return result; // two fields: isSat and satisfyingAssignment
}

// Receives the current assignment and produces the next one
function nextAssignment(currentAssignment) {
    let valorAssignment = 0;
    let cont = 0;
    for (let i = currentAssignment.length - 1; i >= 0; i--) {
        if (currentAssignment[i] == true) {
            valorAssignment = valorAssignment + Math.pow(2,cont);
        }
        cont ++;
    }
    let num = (valorAssignment +1).toString(2);
    num += '';
    let newAssignment = [];
    let numLength = num.length;
    if (numLength != currentAssignment.length) {
        for (let k = 0; k < currentAssignment.length - numLength; k ++) {
            num = '0' + num;
        }
    }

    for (i = 0; i < num.length; i++) {
        if(num.charAt(i) == 1) {
            newAssignment[i] = true;
        } else {
            newAssignment[i] = false;
        }
    }

    if(newAssignment.length == currentAssignment.length) {
        return newAssignment;
    }else{
        return false;
    }
}

function doSolve(clauses, assignment) {
    let isSat = false;
    let numClauses = clauses.length;
    let assignmentsTested = 0;
    while ((!isSat) && (assignment != false)/* must check whether this is the last assignment or not*/) {
        // does this assignment satisfy the formula? If so, make isSat true.
        let falseClause = false;
        for(let i = 0; i < numClauses && !falseClause; i++) {
            let satClause = false;
            for (let j = 0; j < clauses[i].length && !satClause; j++) {
                let replace = clauses[i][j].replace('-', '');
                if(clauses[i][j].charAt(0) == '-') {
                    if(!assignment[replace - 1]) {
                        satClause = true;
                    }
                } else {
                    if(assignment[replace - 1]) {
                        satClause = true;
                    }
                }
            }
            if (!satClause) {
                // if not, get the next assignment and try again.
                assignmentsTested ++;
                if (assignmentsTested%1000000 == 0 && assignment.length > 19) {
                    console.log('Assignments tested: ' + assignmentsTested.toLocaleString('pt-BR'));
                }
                assignment = nextAssignment(assignment);
                falseClause = true;
            }
        }
        if (!falseClause) {
            isSat = true;
        }
    }
    console.log('Assignments tested: ' + assignmentsTested);
    let result = {'isSat': isSat, satisfyingAssignment: null}
    if (isSat) {
        result.satisfyingAssignment = assignment;
    }
    return result
}

function readFormula(fileName) {
    var fs = require("fs");
    let leitor = fs.readFileSync(fileName,'utf8');

    // To read the file, it is possible to use the 'fs' module.
    // Use function readFileSync and not readFile.
    // First read the lines of text of the file and only afterward use the auxiliary functions.
    let text  = leitor.split("\n");
    let clauses = readClauses(text);
    let variables = readVariables(clauses);

    // In the following line, text is passed as an argument so that the function
    // is able to extract the problem specification.
    let specOk = checkProblemSpecification(text, clauses, variables);
    let result = { 'clauses': [], 'variables': [] }
    if (specOk) {
        result.clauses = clauses;
        result.variables = variables;
    }
    return result
}
function readClauses(text) {
    let line = 0;
    let clauses = [];
    j = 0;
    let lastline = '';
    for (i = 0; i < text.length; i++) {
        if(text[i].charAt(0) != 'p' && text[i].charAt(0) != 'c' && text[i].charAt(0) != '') {
            let checkZero = text[i];
            if(checkZero.charAt(checkZero.length - 1) == '0' && checkZero.charAt(checkZero.length - 2) == ' ') {
                checkZero = checkZero.replace(" ", "");
                lastline = lastline + text[i].replace(' 0', '');
                let spliter = lastline.split(" ");
                spliter = spliter.filter(function (s) { return s !='' })
                clauses[j] = spliter;
                let added = 0;
                added++;
                lastline = '';
                j++;
            } else {
                lastline += text [i] + ' ';
            }
        }
    }
    return clauses;
}
function readVariables(clauses) {
    let variables = [];
    let add = 0;
    for (i = 0; i < clauses.length; i++) {
        for(j = 0; j < clauses[i].length; j++) {
            let has = false;
            for(k = 0; k < variables.length && !has; k++) {
                if (variables[k] == clauses[i][j].replace("-", "")) {
                    has = true;
                }
            }
            if (!has) {
                variables[add] = clauses[i][j].replace("-", "");
                add++;
            }
        }
    }
    for(i = 0; i < variables.length; i++) {
        variables[i] = false;
    }
    return variables;
}
function checkProblemSpecification(text, clauses, variables) {
    let numClauses = 0;
    let numVariables = 0;
    let find = false;
    for (i = 0; i < text.length && !find; i++) {
        if (text[i].charAt(0) == 'p') {
            let spliter = text[i].split(" ");
            numClauses = spliter[3];
            numVariables = spliter[2];
            find = true;
        }
    }
    if (!find) {
        return true;
    }
    if(clauses.length == numClauses && variables.length == numVariables) {
        return true;
    } else {
        return false;
    }
}

console.log(exports.solve('simple0.cnf'));