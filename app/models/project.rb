class Project < ActiveRecord::Base
#  has_many :nd_experiment_projects

  has_and_belongs_to_many :nd_experiments, :join_table => :nd_experiment_project
  has_many :projectprops
  has_and_belongs_to_many :pubs, :join_table => :project_pub

#  has_many :stocks, :through => :nd_experiments, :source => :stocks;

  validates_presence_of( :name, :description )


#  def stocks_uniq()
#    {
#      nd_experiments(self).map { |s| s.stocks }; 
#      @stocks = nd_experiments.collect{|e| e.stocks}.flatten.uniq
#    }
#  end

# named_scope :stocks 

  def as_json(options = {})
    { 
      :name => name,
      :description => description,      
      :stocks => nd_experiments.collect{|e| e.stocks}.flatten.uniq.as_json,
#     :experiments => nd_experiments.as_json,
#      :publications => publication
      :props => projectprops.as_json
    }
  end

  def as_json_min(options = {})
    {
      :name => name,
      :description => description,      
      :stock_ids => nd_experiments.collect{|e| e.stocks}.flatten.uniq.collect{|s| s.stock_id},
      #      :experiment_ids => nd_experiments.collect{|e| e.id},
      :publications => pubs,
      :props => projectprops.as_json
    }
  end


#  def as_json_subs(options = {})
#    super(:only => [:name, :description], :include =>[:projectprops])
#  end

end

