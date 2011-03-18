class NdExperimentGenotype < ActiveRecord::Base

  belongs_to :nd_experiment
  belongs_to :genotype,  :class_name => 'Genotype', :foreign_key => :genotype_id

  validates_presence_of( :nd_experiment_id, :genotype_id )
end
