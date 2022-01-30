const mongoose =require('mongoose');
const {Schema} =  mongoose;
const { DateTime } = require("luxon");

const AuthorSchema = new Schema({
    first_name: {type: String, required: true, maxLength: 100},
    family_name: {type: String, required: true, maxLength: 100},
    date_of_birth : Date,
    date_of_death : Date

});


// To avoid errors in cases where an author does not have either a family name or first name
// We want to make sure we handle the exception by returning an empty string for that case

AuthorSchema.virtual('name').get(function (){

    let fullname ='';
    
    if(this.first_name && this.family_name){
        fullname = this.family_name +', '+this.first_name;       
    }
    if(!this.first_name || !this.family_name){
        fullname ='';
    }
    return fullname;
});

//Virtual for author's lifespan
AuthorSchema.virtual('lifespan').get(function(){
    let date_of_birth = '';
    let date_of_death = '';
    if(this.date_of_birth){
        date_of_birth = DateTime.fromJSDate(this.date_of_birth).toLocaleString(DateTime.DATE_MED);
         date_of_death = 'present';
    }
    if(this.date_of_death){
            date_of_death =DateTime.fromJSDate(this.date_of_death).toLocaleString(DateTime.DATE_MED);
    }
    //let lifetime_string ='';
    return  date_of_birth +' - ' +date_of_death;
   /* if(this.date_of_birth){
        lifetime_string = this.date_of_birth.getYear().toString();

    }
    lifetime_string += ' - ';
    if(this.date_of_death){
        lifetime_string += this.date_of_death.getYear();
    }
    return lifetime_string;*/
});

//Virtual for author's URL
AuthorSchema.virtual('url').get(function(){
    return '/catalog/author/' + this._id;
})

module.exports = mongoose.model('Author', AuthorSchema);


