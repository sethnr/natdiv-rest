class Prop < ActiveRecord::Base
  self.abstract_class = true 
  belongs_to :cvterm, :foreign_key=>'type_id'
  validates_presence_of( :type_id )

#  belongs_to :type,       :class_name => "Cvterm", :foreign_key => :type_id

def print_type 
  self.cvterm.nil? ? "null" : self.cvterm.cv.name+":"+self.cvterm.name
#  self.cvterm.as_json
end

def as_json(options = {})
  {
    :type => self.print_type,
    :value => self.value,
    :rank => self.rank
#    :definition => cvterm.definition,
#    :dbxref => dbxref.accession,
  }
end



end
