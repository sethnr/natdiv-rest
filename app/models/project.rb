class Project < ActiveRecord::Base
#  has_many :nd_experiment_projects

  has_and_belongs_to_many :nd_experiments, :join_table => :nd_experiment_project
  has_many :projectprops


#  has_many :stocks, :through => :nd_experiments, :source => :stocks;

  validates_presence_of( :name, :description )

  
#  has_many :nd_experiment_stocks, :through => nd_experiment_projects

#  has_many :stocks, :finder_sql => 'SELECT DISTINCT s.* FROM project p LEFT JOIN nd_experiment_project ep USING(project_id) LEFT JOIN nd_experiment e ON ep.nd_experiment_id = e.nd_experiment_id LEFT JOIN nd_experiment_stock es ON e.nd_experiment_id = es.nd_experiment_id LEFT JOIN stock s USING (stock_id)'


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
#      :stocks => stocks.as_json
      :stocks => nd_experiments.collect{|e| e.stocks}.flatten.uniq.as_json,
#      :stocks nd_experiments.collect { |e| e.stocks }.flatten
#      :stocks => nd_experiments.collect{|e| e.stocks}.uniq
#     :experiments => nd_experiments.as_json,
#      :publications => publication
    }
  end
end

