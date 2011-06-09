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
      format.html # index.html.erb
      format.json { render :json => @stock }
    end
  end

end
