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

  def stocks
    return Stock.find_by_sql("select * from stock join nd_experiment_stock using (stock_id) join nd_experiment_project using (nd_experiment_id) where project_id = "+id.to_s)
  end

  def as_json(options = {})
    { 
      :id => id,
      :name => name,
      :description => description,      
      :props => projectprops.as_json
      :publications => pubs,
      :stocks => stocks.as_json,
#     :experiments => nd_experiments.as_json,
    }
  end

  def as_json_min(options = {})
    {
      :id => id,
      :name => name,
      :description => description,
      :props => projectprops.as_json
      :publications => pubs,
    }
  end


#  def as_json_subs(options = {})
#    super(:only => [:name, :description], :include =>[:projectprops])
#  end

end

