class ProjectController < ApplicationController

  def index
#    redirect_to :action => :list
    @projects = Project.all[0..10]
    respond_to do |format|
      format.json {render :json => @projects.collect{|p| p.as_json_min()} }
      format.xml  { render :xml => @project }
    end
  end

  def show
    @project = Project.find(params[:id])
     respond_to do |format|
#       format.html # index.html.erb
       format.json { render :json => @project }
       format.xml  { render :xml => @project }
     end
  end

  def head
    @project = Project.find(params[:id])
     respond_to do |format|
#       format.html # index.html.erb
#       format.xml  { render :xml => @project }
       format.json { render :json => @project.as_json_min() }
     end
  end

  def stocks
    @project = Project.find(params[:id])
     respond_to do |format|
#       format.html # index.html.erb
      format.json { render :json => @project.nd_experiments.collect{|e| e.stocks}.flatten.uniq.collect{|s| s.as_json} }
      format.xml  { render :xml => @project.nd_experiments.collect{|e| e.stocks}.flatten.uniq }
     end
  end

  def experiments
    @project = Project.find(params[:id])
     respond_to do |format|
      format ||= json
#       format.html 
      format.json { render :json => @project.nd_experiments.collect{ |e| e.as_json()} }
      format.xml  { render :xml => @project.nd_experiments }
     end
  end


end
