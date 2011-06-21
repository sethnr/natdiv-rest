class NdExperiment < ActiveRecord::Base
  belongs_to :cvterm, :foreign_key => 'type_id'

  belongs_to :nd_geolocation

  has_many :nd_experimentprops
  has_many :nd_experiment_dbxrefs
  has_and_belongs_to_many :genotypes, :join_table => :nd_experiment_genotype
  has_and_belongs_to_many :phenotypes, :join_table => :nd_experiment_phenotype
  has_and_belongs_to_many :projects
  has_many :nd_experiment_protocols
  has_many :nd_protocols, :through => :nd_experiment_protocols;
  has_many :nd_experiment_stocks
  has_many :stocks, :through => :nd_experiment_stocks
#  has_many :stocks, through: :nd_experiment_stocks;
#  has_and_belongs_to_many :stocks
  has_one :type, :class_name => "Cvterm", :primary_key => "type_id", :foreign_key => "cvterm_id"

  validates_presence_of(:nd_geolocation_id, :type_id)

  def as_json(options = {})
    { 
      :id => nd_experiment_id,
      :type => self.type.name,
#      :genotypes => nd_experiment_genotypes.genotype.name,
      :genotypes => genotypes.as_json,
      :geolocation => nd_geolocation.as_json,
      :phenotypes => phenotypes.as_json,
      :protocols => nd_protocols.as_json,
      :props => nd_experimentprops.as_json,
      :stock_ids => stocks.collect{|s| s.id}
    }
  end

  def as_json_min(options = {})
    { 
      :id => nd_experiment_id,
      :type => self.type.name
#      :props => nd_experimentprops.as_json,
#      :stock_ids => stocks.collect{|s| s.stock_id}
    }
  end


end
