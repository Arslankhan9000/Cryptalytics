class BlogDTO {
    constructor(blog){
        this._id = blog._id;
        this.title = blog.title;
        this.author = blog.author;
        this.photo = blog.photoPath;
        this.content = blog.content;
     // this.photo = blog.imgPath;
    }
}

module.exports = BlogDTO;