class ProjectController < ApplicationController

  def index
#    redirect_to :action => :list
     @project = Project.all
 
     respond_to do |format|
       format.html # index.html.erb
       format.xml  { render :xml => @phenotypes }
       format.json { render :json => @phenotypes }
     end



  end

  def show
    @phenotype = Phenotype.find(params[:id])
  end
end
