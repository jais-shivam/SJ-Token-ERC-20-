import { tokens, EVM_REVERT } from './Helper';
const Token= artifacts.require('./Token');

require('chai')
.use(require('chai-as-promised'))
.should();


contract('Token',([deployer,receiver,exchange])=>{
    const name='SJ Token';
    const symbol="<><>";
    const decimals='18';
    const totalSupply=tokens(1000000).toString();
    let token;

    beforeEach(async ()=>{
         token= await Token.new();//Fetch token from BChain
    })
    describe('deployment',()=>{
        
        it('tracks the name',async ()=>{
            const result = await token.name();
            result.should.equal(name);
        })
        it('tracks the symbol',async ()=>{
            const result = await token.symbol();
            result.should.equal(symbol);
        })
        it('tracks the decimal',async ()=>{
            const result = await token.decimals();
            result.toString().should.equal(decimals);
        })
        it('tracks the total supply',async ()=>{
            const result = await token.totalSupply();
            result.toString().should.equal(totalSupply.toString());
        })
        it('assign the total supply to the deployer',async ()=>{
            const result=await token.balanceOf(deployer);
            result.toString().should.equal(totalSupply.toString());
        })
    })

    describe('sending tokens',()=>{
        let result,amount;

        describe('success ',async ()=>{
            beforeEach(async ()=>{
                amount=tokens(100);
                result= await token.transfer(receiver,amount,{from:deployer});
           })
            it('transfer token balance', async ()=>{
                let balanceOf;
                // After transfer 
                balanceOf=await token.balanceOf(deployer);
                balanceOf.toString().should.equal(tokens(999900).toString());
                // console.log('deployer balance after transfer',balanceOf.toString());
                balanceOf=await token.balanceOf(receiver);
                balanceOf.toString().should.equal(tokens(100).toString());
                // console.log('receiver balance after transfer',balanceOf.toString());
    
            })
    
            it('Emit a transfer event', async ()=>{
                // console.log(result.logs[0]);
                const log=result.logs[0];
                log.event.should.eq('Transfer');
                const event= log.args;
                event.from.should.eq(deployer,'From is correct');
                event.to.should.eq(receiver,' To is correct');
                event.value.toString().should.eq(amount.toString(), 'Value is correct');
    
            })
        })

        describe('failure ',async ()=>{
            it('rejects insufficient token balance account', async ()=>{
                let invalidAmount=tokens(100000000);// 100 million
                await token.transfer(receiver,invalidAmount,{from:deployer}).should.rejectedWith(EVM_REVERT);
            
                //Attempt transfer token, When you have none
                invalidAmount=tokens(10);
                await token.transfer(deployer,invalidAmount,{from:receiver}).should.rejectedWith(EVM_REVERT);
            })

            it('rejects invalid recipient', async()=>{
                await token.transfer(0x0,amount,{from:deployer}).should.rejected;
            })
        })
    })

    describe('approving tokens', ()=>{
        let result,amount;
        beforeEach(async()=>{
            amount=tokens(100);
            result=await token.approve(exchange,amount,{from:deployer});
        })

        describe('Success',()=>{
            it('allocate an allowance for delegated token spending on exchange', async()=>{
                const allowance= await token.allowance(deployer,exchange);
                // console.log(allowance.toString()+'  '+amount.toString());
                allowance.toString().should.eq(amount.toString());
            })

            it('emits an Approval event', async () => {
                const log = result.logs[0]
                log.event.should.eq('Approval')
                const event = log.args
                event.owner.toString().should.equal(deployer, 'owner is correct')
                event.spender.should.equal(exchange, 'spender is correct')
                event.value.toString().should.equal(amount.toString(), 'value is correct')
              })
        })

        describe('failure',()=>{
            it('rejects invalid recipient', async()=>{
                await token.approve(0x0,amount,{from:deployer}).should.rejected;
            })
        })
    })

    describe('describe delegated token',()=>{
        let result,amount;

        beforeEach(async ()=>{
            amount=tokens(100);
            await token.approve(exchange,amount,{from:deployer});
        })

        describe('success ',async ()=>{
            beforeEach(async ()=>{
                result= await token.transferFrom(deployer, receiver, amount,{from:exchange});
           })
            it('transfer token balance', async ()=>{
                let balanceOf;
                // After transfer 
                balanceOf=await token.balanceOf(deployer);
                balanceOf.toString().should.equal(tokens(999900).toString());
                // console.log('deployer balance after transfer',balanceOf.toString());
                balanceOf=await token.balanceOf(receiver);
                balanceOf.toString().should.equal(tokens(100).toString());
                // console.log('receiver balance after transfer',balanceOf.toString());
    
            })
            it('resets the allowance balance', async()=>{
                const allowance= await token.allowance(deployer,exchange);
                allowance.toString().should.eq('0');
            })

    
            it('Emit a transfer event', async ()=>{
                // console.log(result.logs[0]);
                const log=result.logs[0];
                log.event.should.eq('Transfer');
                const event= log.args;
                event.from.should.eq(deployer,'From is correct');
                event.to.should.eq(receiver,' To is correct');
                event.value.toString().should.eq(amount.toString(), 'Value is correct');
    
            })
        })

        describe('failure ',async ()=>{
            it('rejects insufficient token balance account or if its > than approve token', async ()=>{
                let invalidAmount=tokens(1000);// 100 million
                await token.transferFrom(deployer, receiver,invalidAmount,{from:exchange}).should.rejectedWith(EVM_REVERT);
            })

            it('rejects invalid recipient', async()=>{
                await token.transferFrom(deployer, 0x0,amount,{from:exchange}).should.rejected;
            })
        })
    })

})