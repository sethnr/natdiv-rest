class NdExperiment < ActiveRecord::Base
  belongs_to :cvterm, :foreign_key => 'type_id'

  belongs_to :nd_geolocation

  has_many :nd_experimentprops
  has_many :nd_experiment_dbxrefs
#  has_many :nd_experiment_genotypes
#  has_many :nd_experiment_phenotypes
  has_and_belongs_to_many :genotypes, :join_table => :nd_experiment_genotype
  has_and_belongs_to_many :phenotypes, :join_table => :nd_experiment_phenotype
#  has_many :nd_experiment_projects
  has_and_belongs_to_many :projects
  has_many :nd_experiment_protocols
  has_many :nd_experiment_stocks
#  has_many :stocks, through: :nd_experiment_stocks;
  has_and_belongs_to_many :stocks

  validates_presence_of(:nd_geolocation_id, :type_id)

  def as_json(options = {})
    { 
      :id => nd_experiment_id,
      :type => type_id,
#      :genotypes => nd_experiment_genotypes.genotype.name,
      :genotypes => genotypes.as_json,
#      :phenotypes => nd_experiment_phenotypes.phenotype.name,
      :phenotypes => phenotypes.as_json,
#      :stocks => stocks.as_json
    }
  end


end
