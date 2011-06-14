class NdExperimentprop < Prop

  belongs_to :nd_experiment

  validates_presence_of( :nd_experiment_id, :type_id )

end
