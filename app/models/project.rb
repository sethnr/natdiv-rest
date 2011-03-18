class Project < ActiveRecord::Base
#  has_many :nd_experiment_projects

  has_and_belongs_to_many :nd_experiments, :join_table => :nd_experiment_project
  has_many :projectprops

  validates_presence_of( :name, :description )

  def as_json(options = {})
    { 
      :name => name,
      :description => description,
      :experiments => nd_experiments.as_json,
#      :publications => publication
    }
  end
end
