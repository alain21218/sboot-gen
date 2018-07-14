String.prototype.capitalize = function() {
    return this.charAt(0).toUpperCase() + this.slice(1).toLowerCase();
}

String.prototype.path = function() {
    const pathSplit = this.split('/');
    return pathSplit.slice(0, pathSplit.length - 1).join('/');
}

String.prototype.pathFile = function() {
    const pathSplit = this.split('/');
    return pathSplit[pathSplit.length - 1];
}

String.prototype.replaceAll = function(from, to) {
    return this.split(from).join(to);
}