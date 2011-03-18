class ProjectController < ApplicationController

  def index
#    redirect_to :action => :list
     @projects = Project.all
 
     respond_to do |format|
       format.html # index.html.erb
       format.xml  { render :xml => @projects }
       format.json { render :json => @projects }
     end



  end

  def show
    @project = Project.find(params[:id])
     respond_to do |format|
       format.html # index.html.erb
       format.xml  { render :xml => @project }
       format.json { render :json => @project }
     end
  end
end
