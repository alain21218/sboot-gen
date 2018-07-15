String.prototype.capitalize = function() {
    return this.charAt(0).toUpperCase() + this.slice(1).toLowerCase();
}

String.prototype.replaceAll = function(from, to) {
    return this.split(from).join(to);
}