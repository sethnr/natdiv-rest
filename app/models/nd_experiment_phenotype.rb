class NdExperimentPhenotype < ActiveRecord::Base

  belongs_to :nd_experiment
  belongs_to :phenotype, :class_name => 'Phenotype', :foreign_key => :phenotype_id
  has_many :nd_experiment_phenotypeprops

  validates_presence_of( :nd_experiment_id, :phenotype_id )
end
