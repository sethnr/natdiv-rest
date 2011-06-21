class StockController < ApplicationController

  def index
     @stocks = Stock.all
     respond_to do |format|
       format.html # index.html.erb
       format.json { render :json => @stock }
     end
  end


  def show
    @stock = Stock.find(params[:id])
    respond_to do |format|
#      format.html # index.html.erb
      format.json { render :json => @stock }
      format.xml  { render :xml => @stock }
    end
  end

  def head
    @stock = Stock.find(params[:id])
     respond_to do |format|
#       format.html # index.html.erb
#       format.xml  { render :xml => @stock }
       format.json { render :json => @stock.as_json_min() }
     end
  end

  def projects
    @stock = Stock.find(params[:id])
     respond_to do |format|
#      format.html # index.html.erb
      format.json { render :json => @stock.nd_experiments.collect{|e| e.projects}.flatten.uniq.collect{|p| p.as_json_min} }
      format.xml  { render :xml => @stock.nd_experiments.collect{|e| e.projects}.flatten.uniq }
     end
  end

  def experiments
    @stock = Stock.find(params[:id])
     respond_to do |format|
#      format.html # index.html.erb
      format.json { render :json => @stock.nd_experiments.as_json }
      format.xml  { render :xml => @stock.nd_experiments }
    end
  end


end
