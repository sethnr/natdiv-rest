class Prop < ActiveRecord::Base
  self.abstract_class = true 
  belongs_to :cvterm, :foreign_key=>'type_id'
  validates_presence_of( :type_id )

#  belongs_to :type,       :class_name => "Cvterm", :foreign_key => :type_id


def as_json(options = {})
  {
    :type => cvterm.cv.name+":"+cvterm.name,
    #REVERT TO ABOVE ONCE jsonPATH in place
    :value => self.value,
    :rank => self.rank
#    :definition => cvterm.definition,
#    :dbxref => dbxref.accession,
  }
end



end
