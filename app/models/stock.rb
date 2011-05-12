class Stock < ActiveRecord::Base

  belongs_to :dbxref, :class_name => 'Dbxref', :foreign_key => :dbxref_id
  belongs_to :organism, :class_name => 'Organism', :foreign_key => :organism_id
  has_many :cvterms, :through => :stock_cvterms
  has_many :dbxrefs 
  has_many :genotypes 
  has_many :pubs 
  has_many :stock_cvterms , :foreign_key => :stock_id
  has_many :stock_dbxrefs , :foreign_key => :stock_id
  has_many :stock_genotypes , :foreign_key => :stock_id
  has_many :stock_pubs , :foreign_key => :stock_id
  has_many :stockcollection_stocks , :foreign_key => :stock_id
  has_many :stockcollections 
  has_many :stockprops , :foreign_key => :stock_id
  has_many :stocksamples
  has_many :nd_experiment_stocks
  has_many :nd_experiments, :through => :nd_experiment_stocks
#  has_and_belongs_to_many :nd_experiments, :join_table => :nd_experiment_stock
  validates_presence_of( :uniquename, :type_id)

  def as_json(options = {})
    {
      :name => name,
      :uniquename => uniquename,
      :type => type_id,
      :spp => organism.genus+" "+organism.species,
      :props => stockprops.as_json,
      :experiments => nd_experiments.as_json
    }
  end
  
end
