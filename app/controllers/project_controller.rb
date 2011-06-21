class ProjectController < ApplicationController

  def index
#    redirect_to :action => :list
     @projects = Project.all[0..10]
    render :json => @projects.collect{|p| p.as_json_min()}
  end

  def show
    @project = Project.find(params[:id])
     respond_to do |format|
       format.html # index.html.erb
       format.xml  { render :xml => @project }
       format.json { render :json => @project }
     end
  end

  def head
    @project = Project.find(params[:id])
     respond_to do |format|
       format.html # index.html.erb
       format.xml  { render :xml => @project }
       format.json { render :json => @project.as_json_min() }
     end
  end

  def stocks
    @project = Project.find(params[:id])
     respond_to do |format|
       format.html # index.html.erb
       format.xml  { render :xml => @project }
       format.json { render :json => @project.nd_experiments.collect{|e| e.stocks}.flatten.uniq.as_json }
     end
  end

  def experiments
    @project = Project.find(params[:id])
     respond_to do |format|
       format.html # index.html.erb
       format.xml  { render :xml => @project }
       format.json { render :json => @project.nd_experiments.as_json_min() }
     end
  end


end
