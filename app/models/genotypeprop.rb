class Genotypeprop < Prop
  
#  belongs_to :cvterm, :foreign_key=>'type_id'
  belongs_to :genotype, :class_name => 'Genotype', :foreign_key => :genotype_id
  has_many :pubs 
  has_many :genotypeprop_pubs , :foreign_key => :stockprop_id

  validates_presence_of( :stock_id, :type_id )

end
