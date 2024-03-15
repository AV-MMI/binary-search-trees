let modifiedNodes = [];

class Node {
    constructor(value, left=null, right=null){
        this.value = value;
        this.left = left;
        this.right = right;
    }
}

class Tree {
    constructor(arr){
        this.root = this.buildTree( this.treatArr(arr) );
    }

    treatArr(arr){
        let newArr = [...new Set( arr.slice().sort((a,b) => a-b) )];
        return newArr;
    }

    buildTree(arr){
        arr = this.treatArr(arr);
        if(arr.length !== 0){
            let middle = (arr.length == 2) ? 0 : Math.floor(arr.length/2);
            let leftArr = arr.slice(0, middle) || [];
            let rightArr = arr.slice(middle+1) || [];

            let leftNode = this.buildTree(leftArr);
            let rightNode = this.buildTree(rightArr);

            let rootNode = new Node(arr[middle], leftNode, rightNode);

            return rootNode
        }
    }

    insert(value){
        if( !(this.find(value)) ){
            let newNode = new Node(value);
            function traverse(node){
                if(node == null){
                    return;
                } else {
                    let rootNode = node;
                    // set in left
                    if(rootNode.value > newNode.value && rootNode.left == null){
                        rootNode.left = newNode;
                        return;
                    }
                    // set in right
                    else if(rootNode.value < newNode.value && rootNode.right == null){
                        rootNode.right = newNode;
                        return;
                    }

                    // determine which branch
                    let goLeft = (rootNode.value > newNode.value) ? true : false;
    
                    // which branch? 
                    if(goLeft){
                        return traverse(rootNode.left);
                    } else {
                        return traverse(rootNode.right);
                    }
                }
            }

            traverse(this.root);
        }
    }

    // for root nodes.
    retrieveGreaterNode = (node, value=0) => {
        while(node){
            if(node.value !== value && node.left == null){
                let nodeRetrieved = node;
                return nodeRetrieved;
            }

            else if(node.left.value < value){
                node = node.right;
            }

            else if(node.left.value > value){
                node = node.left;
            }
        }
    }

    // remove all references to null value nodes -- helper of traverseAndDelete
    removeNull(parentNode){
        if(parentNode.right || parentNode.left){
            if(!parentNode.left || !parentNode.right){
                let nullDir = (!parentNode.left || parentNode.left.value == null) ? "left" : "right";
                parentNode[nullDir] = null;
                
            } else {
                // keep recurring the tree:
                let leftBranchNode = (parentNode.left) ? parentNode.left : null;
                let rightBranchNode = (parentNode.right) ? parentNode.right : null;

                this.removeNull(leftBranchNode);
                this.removeNull(rightBranchNode)
            }
        }
    }

    // traverse through our tree until it finds the target node, then it "removes" from the tree
    traverseAndDelete = (currNode, value) => {
        // we Found our target node!
        if(currNode.value == value){
            // determine the type of node
                // no child || one child
            if(!currNode.left || !currNode.right){
                    // no child
                if(!currNode.left && !currNode.right){
                    currNode.value = null;
                    return;
                }
                    // one child
                else if(!currNode.left){
                    currNode.value = currNode.right.value;
                    currNode.right = currNode.right.right;
                    return 
                }
                else if(!currNode.right){
                    currNode.value = currNode.left.value;
                    currNode.left = currNode.left.left;
                    return
                }
            }else {
                 // both child
                    let replaceNode = this.retrieveGreaterNode(currNode, currNode.value);
                    currNode.value = replaceNode.value;
                    if(currNode.right.value > replaceNode.right.value){
                        let tempNode = replaceNode;
                        tempNode.right.right = currNode.right;

                        currNode.right = tempNode.right;
                    } else {
                        currNode.right = replaceNode.right;
                    }
                }
        } else {
                // recurr down the tree
                    if(currNode.value < value){
                        return this.traverseAndDelete(currNode.right, value);
                    } else {
                        return this.traverseAndDelete(currNode.left, value);
                    }
                
                }
            }

    delete(value){
        if(this.find(value)){
            this.traverseAndDelete(this.root, value);
            this.removeNull(this.root);
            return;
        }
 
    }

    find(value){
        function traverse(node){
            if(node == null){
                return;
            } else {
                // check if current node contains the value we are looking for
                if(node.value == value){
                    return node;
                }

                let leftNode = node.left;
                let rightNode = node.right;

                // which branch? 
                if(node.value > value){
                    return traverse(leftNode);
                } else {
                    return traverse(rightNode);
                }
            }
        }

        return traverse(this.root);
    }

    levelOrder(cb){
        let discoveredNodesArr = [this.root];
        let orderArr = [this.root.value];
        
        do {
            let currNode = discoveredNodesArr.shift();

            if(cb){
                if(currNode){
                    cb(currNode);
                }
            }

            if(currNode.left || currNode.right){
                if(currNode.left && currNode.right){
                    discoveredNodesArr.push(currNode.left, currNode.right);
                    orderArr.push(currNode.left.value, currNode.right.value);
                }
                else if(currNode.left){
                    discoveredNodesArr.push(currNode.left);
                    orderArr.push(currNode.left.value);
                }
                else if(currNode.right){
                    discoveredNodesArr.push(currNode.right);
                    orderArr.push(currNode.right.value);
                }
            }

        } while(discoveredNodesArr.length > 0);

        
        return orderArr;
    }

    //root, left, right
    preOrder(cb){
        let discoveredNodesArr = [this.root];
        let orderArr = [];
        let rightBranchArr = []
        do {
            let currNode;
            if(discoveredNodesArr.length > 0){
                currNode = discoveredNodesArr.shift();
            } else {
                currNode = rightBranchArr.shift();
            }

            if(cb){
                if(currNode){
                    cb(currNode);
                }
            } else {
                orderArr.push(currNode.value);
            }

            // first left
            if(currNode.left){
                discoveredNodesArr.push(currNode.left);
            }

            if(currNode.right){
                rightBranchArr.unshift(currNode.right);
            }

            // then right
        } while(discoveredNodesArr.length > 0 || rightBranchArr.length > 0)

        if(!cb){
            return orderArr;
        }
    }

    // left, right, root
    postOrder(cb){
        let orderArr = [];

        function postOrderRecursion(root){
            if(!root){
                return;
            } else {
                postOrderRecursion(root.left);
                postOrderRecursion(root.right);
                orderArr.push(root.value);
                if(cb){
                    cb(root); 
                }
            }
        }

        postOrderRecursion(this.root);
    
        if(!cb){
            return orderArr;
        }
    }

    // left, root, right
    inOrder(cb){
        let orderArr = [];

        function inOrderRecursion(root){
            if(!root){
                return;
            } else {
                inOrderRecursion(root.left);
                if(cb){
                    cb(root); 
                } else {
                    orderArr.push(root.value);
                }
                inOrderRecursion(root.right);
            }
        }

        inOrderRecursion(this.root);
    
        if(!cb){
            return orderArr;
        }
    }

    // node to leaf node
    height(node){
        
        function recursiveHeight(node){
            if(!node){
                return -1;
            } else {
                let leftBranch = recursiveHeight(node.left);
                let rightBranch = recursiveHeight(node.right);

                return Math.max(leftBranch, rightBranch)+1;
            }
        }

        return recursiveHeight(node);
    }

    // root to node
    depth(node){

        function recursiveDepth(node, tNode, n=0){
            if(node == null){
                return -1;
            } else {
                if(node.value == tNode.value){
                    return n;
                } else {
                    let a = recursiveDepth(node.left, tNode, n+1);
                    let b = recursiveDepth(node.right, tNode, n+1);

                    return Math.max(a, b);
                }
            }
        }

        return recursiveDepth(this.root, node);
    }

    isBalanced(){
        let leftHeight = this.height(this.root.left);
        let rightHeight = this.height(this.root.right);

        return (leftHeight == rightHeight);
    }

    rebalance(){
        let treeArr = this.inOrder();

        this.root = this.buildTree(treeArr);
        return;
    }
    
}

let binaryTree = new Tree([1,2,3,4,5,6]);
binaryTree.insert(-1);
console.log(binaryTree.find(6), 'find')
console.log(binaryTree.isBalanced(), 'before rebalance');
console.log(binaryTree.root.value, 'root');
console.log(binaryTree.rebalance());
console.log(binaryTree.isBalanced(), 'after rebalance')
console.log(binaryTree.root.value, 'root');
//console.log(binaryTree.treatArr([9,2,3,1,3,5,8,6,10,12,13]), 'find')
