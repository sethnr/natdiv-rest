class ProjectPub < ActiveRecord::Base
    belongs_to :pub, :class_name => 'Pub', :foreign_key => :pub_id
  belongs_to :project, :class_name=> 'Project', :foreign_key => :project_id
    
end
