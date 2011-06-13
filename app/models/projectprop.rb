class Projectprop < Prop
  belongs_to :project
  

  validates_presence_of( :project_id, :type_id )
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
